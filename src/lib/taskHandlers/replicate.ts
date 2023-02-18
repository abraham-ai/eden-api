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
  error: string;
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

const handleUpdate = async (server: FastifyInstance, taskId: string, output: ReplicateOutput[]) => {  

  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  if (task.status === 'completed') {
    return;
  }

  output = Array.isArray(output) ? output : [output];
  output = output.filter((o: ReplicateOutput) => o);

  const intermediateOutputs = output.filter((o: ReplicateOutput) => !o.isFinal);
  const finalOutputs = output.filter((o: ReplicateOutput) => o.isFinal);

  const isCompleted = finalOutputs.length > 0;
  const maxProgress = Math.max(...intermediateOutputs.map((o: ReplicateOutput) => o.progress));

  let taskUpdate = {
    status: isCompleted ? 'completed' : 'running',
    progress: isCompleted ? 1.0 : Math.max(maxProgress, task.progress || 0),  
  };

  if (!task.intermediate_outputs || intermediateOutputs.length > task.intermediate_outputs.length) {
    const intermediateResults = intermediateOutputs.map(async (o: ReplicateOutput) => {
      return {file: o.file, progress: o.progress};
    });
    Object.assign(taskUpdate, {intermediate_outputs: await Promise.all(intermediateResults)});
  };
  
  if (isCompleted) {
    const finalOutput = finalOutputs.slice(-1)[0];
    
    const creationData: CreationSchema = {
      user: task.user,
      task: task._id,
      uri: finalOutput.file,
      thumbnail: finalOutput.thumbnail,
      name: finalOutput.name,
      attributes: finalOutput.attributes,
    }
  
    if (finalOutput.file) {
      creationData.uri = await server.uploadUrlAsset!(server, finalOutput.file);
    }

    if (finalOutput.thumbnail) {
      creationData.thumbnail = await server.uploadUrlAsset!(server, finalOutput.thumbnail);
    }

    const creation = await Creation.create(creationData);

    Object.assign(taskUpdate, {
      output: finalOutput, 
      creation: creation._id
    });
  }

  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
};

const handleFailure = async (taskId: string, error: string) => {

  console.log("HF 1")
  const task = await Task.findOne({
    taskId,
  })

  console.log("HF 2")
  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }
  console.log("HF 3")
  const taskUpdate = {
    status: 'failed',
    error: error,
  }
  console.log("HF 4")
  await Task.updateOne(
    { taskId },
    {
      $set: taskUpdate,
    },
  )
  console.log("HF 5")
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
  });

  console.log("HF 7")
}

const receiveTaskUpdate = async (server: FastifyInstance, update: any) => {
  const { id: taskId, status, output, error } = update as ReplicateWebhookUpdate;

  console.log(`Received update for task ${taskId} with status ${status}`);


  if (error) {
    console.error(`Error for task ${taskId}: ${error}`);
  }


  switch (status) {
    case 'starting':
      break;
    case 'processing':
      await handleUpdate(server, taskId, output);
      break;
    case 'succeeded':
      await handleUpdate(server, taskId, output);
      break;
    case 'failed':
      await handleFailure(taskId, error);
      break;
    case 'cancelled':
      await handleFailure(taskId, "Cancelled");
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