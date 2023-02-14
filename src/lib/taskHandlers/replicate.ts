import { Task } from '../../models/Task';
import { TaskHandlers } from '../../plugins/tasks';
import { FastifyInstance } from 'fastify';
import { Creation, CreationSchema } from '../../models/Creation';
import { Manna } from '../../models/Manna';
import { Transaction } from '../../models/Transaction';


type ReplicateTaskStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

interface ReplicateWebhookUpdate {
  id: string;
  status: ReplicateTaskStatus;
  output: any[];
}

interface ReplicateOutput {
  file: string;
  thumbnail: string;
  name: string;
  attributes: any;
  progress: number;
  isFinal: boolean;
}

const makeWebhookUrl = (server: FastifyInstance) => {
  return `${server.config.WEBHOOK_URL}/tasks/update?secret=${server.config.WEBHOOK_SECRET}`;
}

export const formatStableDiffusionConfigForReplicate = (config: any) => {
  let newConfig = {...config};
  newConfig.interpolation_texts ? newConfig.interpolation_texts = newConfig.interpolation_texts.join("|") : null;
  newConfig.interpolation_seeds ? newConfig.interpolation_seeds = newConfig.interpolation_seeds.join("|") : null;
  newConfig.interpolation_init_images ? newConfig.interpolation_init_images = newConfig.interpolation_init_images.join("|") : null;
  newConfig.voice_file_urls ? newConfig.voice_file_urls = newConfig.voice_file_urls.join("|") : null;
  return newConfig;
}

const submitTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  const replicate = server.replicate;
  if (!replicate) {
    throw new Error('Replicate not initialized');
  }

  const webhookUrl = makeWebhookUrl(server);

  const generatorAddress = generatorVersion.address;
  const model = await replicate.getModel(generatorAddress)
  if (!model.results) {
    throw new Error(`Could not find model ${generatorAddress}`);
  }

  const modelId = generatorVersion.versionId;

  let preparedConfig = formatStableDiffusionConfigForReplicate(config);
  preparedConfig.mode = generatorVersion.mode;
  
  // @ts-ignore
  const task = await replicate.startPrediction(modelId, preparedConfig, webhookUrl, ['start', 'output', 'completed']);
  //const task = await replicate.startPrediction(modelId, preparedConfig, webhookUrl, ['starting', 'processing', 'succeeded', 'failed', 'cancel']);
  return task.id
}

const handleStarting = async (server: FastifyInstance, taskId: string) => {
  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  await Task.updateOne(
    { taskId },
    {
      $set: {status: 'starting', progress: 0},
    },
  )
};

const handleRunning = async (server: FastifyInstance, taskId: string, output: ReplicateOutput[]) => {  

  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  let taskUpdate = {
    status: 'running', 
    progress: 0
  };

  if (output && output.length > 0) {
    output = Array.isArray(output) ? output : [output];
    const assets = output.map(async (o: any) => {
      if (o.file) {
        o.file = await server.uploadUrlAsset!(server, o.file);
      }
      if (o.thumbnail) {
        o.thumbnail = await server.uploadUrlAsset!(server, o.thumbnail);
      }
      return {...o};
    });

    const newOutputs = await Promise.all(assets);
    const intermediateOutputs = await Promise.all(newOutputs.filter((o: ReplicateOutput) => !o.isFinal));

    Object.assign(taskUpdate, {intermediate_outputs: intermediateOutputs});
    taskUpdate['progress'] = output.slice(-1)[0].progress;
  }
  
  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
}

const handleSuccess = async (server: FastifyInstance, taskId: string, output: ReplicateOutput[]) => {  

  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  output = Array.isArray(output) ? output : [output];
  const assets = output.map(async (o: any) => {
    if (o.file) {
      o.file = await server.uploadUrlAsset!(server, o.file);
    }
    if (o.thumbnail) {
      o.thumbnail = await server.uploadUrlAsset!(server, o.thumbnail);
    }
    return {...o};
  });

  const newOutputs = await Promise.all(assets);
  const intermediateOutputs = await Promise.all(newOutputs.filter((o: ReplicateOutput) => !o.isFinal));
  const finalOutputs = await Promise.all(output.filter((o: ReplicateOutput) => o.isFinal));

  let taskUpdate = {status: 'completed'};

  if (finalOutputs.length > 0) {
    const finalOutput = finalOutputs.slice(-1)[0];

    const creationData: CreationSchema = {
      user: task.user,
      task: task._id,
      uri: finalOutput.file,
      name: finalOutput.name,
      thumbnail: finalOutput.thumbnail,
      attributes: finalOutput.attributes,
    }

    const creation = await Creation.create(creationData);

    Object.assign(taskUpdate, {
      output: finalOutput, 
      intermediate_outputs: intermediateOutputs, 
      creation: creation._id
    });
  }

  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
}

const handleFailure = async (taskId: string) => {
  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  const taskUpdate = {
    status: 'failed',
  }

  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )

  // refund the user
  const manna = await Manna.findOne({
    user: task.user,
  })

  if (!manna) {
    throw new Error(`Could not find manna for user ${task.user}`);
  }

  const mannaUpdate = {
    balance: manna.balance + task.cost,
  }

  await Manna.updateOne(
    { user: task.user },
    {
      $set: mannaUpdate,
    },
  )

  await Transaction.create({
    manna: manna._id,
    task: task._id,
    amount: task.cost,
  })
}

const receiveTaskUpdate = async (server: FastifyInstance, update: any) => {
  const { id: taskId, status, output } = update as ReplicateWebhookUpdate;

  switch (status) {
    case 'starting':
      await handleStarting(server, taskId);
      break;
    case 'processing':
      await handleRunning(server, taskId, output);
      break;
    case 'succeeded':
      await handleSuccess(server, taskId, output);
      break;
    case 'failed' || 'cancelled':
      await handleFailure(taskId);
      break;
    default:
      throw new Error(`Unknown status ${status}`);
    }
}

const create = async (server: FastifyInstance, generatorName: string, config: any) => {
  console.log(`Creating task for generator ${generatorName} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true"
}

const getTransactionCost = (_: FastifyInstance, __: string, config: any) => {
  if ( config.n_frames ) {
    return config.n_frames;
  } else {
    return 1;
  }
}

export const replicateTaskHandlers: TaskHandlers = {
  submitTask,
  create,
  receiveTaskUpdate,
  getTransactionCost,
}