import { Task } from '../../models/Task';
import { TaskHandlers } from '../../plugins/tasks';
import { FastifyInstance } from 'fastify';
import { Creation, CreationSchema } from '../../models/Creation';
import { minioUrl } from '../../plugins/minioPlugin';
import { Credit } from '../../models/Credit';
import { Transaction } from '../../models/Transaction';


import fs from 'fs';


type ReplicateTaskStatus = 'starting' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

interface ReplicateWebhookUpdate {
  id: string;
  status: ReplicateTaskStatus;
  output: string[];
}

const makeWebhookUrl = (server: FastifyInstance) => {
  return `${server.config.WEBHOOK_URL}/tasks/update?secret=${server.config.WEBHOOK_SECRET}`;
}

const getGeneratorMode = (generatorName: string) => {
  switch (generatorName) {
    case 'create':
      return 'generate';
    case 'interpolate':
      return 'interpolate';
    case 'remix':
      return 'remix';
    case 'real2real':
      return 'interpolate';
    case 'tts':
      return 'tts';
    default:
      throw new Error(`Unknown generator name: ${generatorName}`);
  }
}

const getGeneratorAddress = (generatorName: string) => {
  switch (generatorName) {
    case 'create':
      return 'abraham-ai/eden-stable-diffusion';
    case 'interpolate':
      return 'abraham-ai/eden-stable-diffusion';
    case 'remix':
      return 'abraham-ai/eden-stable-diffusion';
    case 'real2real':
      return 'abraham-ai/eden-stable-diffusion';
    case 'tts':
      return 'abraham-ai/tts';
    default:
      throw new Error(`Unknown generator name: ${generatorName}`);
  }
}

export const formatStableDiffusionConfigForReplicate = (config: any) => {
  let newConfig = {...config};
  newConfig.interpolation_texts ? newConfig.interpolation_texts = newConfig.interpolation_texts.join("|") : null;
  newConfig.interpolation_seeds ? newConfig.interpolation_seeds = newConfig.interpolation_seeds.join("|") : null;
  newConfig.interpolation_init_images ? newConfig.interpolation_init_images = newConfig.interpolation_init_images.join("|") : null;
  return newConfig;
}

const submitTask = async (server: FastifyInstance, generatorName: string, config: any) => {
  const replicate = server.replicate;
  if (!replicate) {
    throw new Error('Replicate not initialized');
  }

  const webhookUrl = makeWebhookUrl(server);

  const generatorAddress = getGeneratorAddress(generatorName);
  const model = await replicate.getModel(generatorAddress)
  if (!model.results) {
    throw new Error(`Could not find model ${generatorName}`);
  }
  const modelId = model.results[0].id;
  let preparedConfig = formatStableDiffusionConfigForReplicate(config);
  preparedConfig.mode = getGeneratorMode(generatorName);

  console.log("preparedConfig", preparedConfig)
  // @ts-ignore
  const task = await replicate.startPrediction(modelId, preparedConfig, webhookUrl, ['start', 'output', 'completed']);
  return task.id
}

const handleSuccess = async (server: FastifyInstance, taskId: string, output: string[]) => {
  output = Array.isArray(output) ? output : [output];
  const assets = output.map(async (url: string) => {
    const sha = await server.uploadUrlAsset!(server, url);
    const shaUrl = minioUrl(server, sha);
    return shaUrl;
  });
  const newAssets = await Promise.all(assets);

  const task = await Task.findOne({
    taskId,
  })

  if (!task) {
    throw new Error(`Could not find task ${taskId}`);
  }

  const creationData: CreationSchema = {
    user: task.user,
    task: task._id,
    uri: newAssets.slice(-1)[0],
  }

  const creation = await Creation.create(creationData);

  const taskUpdate = {
    status: 'completed',
    output: newAssets,
    creation: creation._id,
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
  const credit = await Credit.findOne({
    user: task.user,
  })

  if (!credit) {
    throw new Error(`Could not find credit for user ${task.user}`);
  }

  const creditUpdate = {
    balance: credit.balance + task.cost,
  }

  await Credit.updateOne(
    { user: task.user },
    {
      $set: creditUpdate,
    },
  )

  await Transaction.create({
    credit: credit._id,
    task: task._id,
    amount: task.cost,
  })
}


const receiveTaskUpdate = async (server: FastifyInstance, update: any) => {
  const { id: taskId, status, output } = update as ReplicateWebhookUpdate;

  switch (status) {
    case 'starting':
      // do nothing
      break;
    case 'processing':
      break;
    case 'succeeded':
      await handleSuccess(server, taskId, output)
      break;
    case 'failed' || 'cancelled':
      await handleFailure(taskId)
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