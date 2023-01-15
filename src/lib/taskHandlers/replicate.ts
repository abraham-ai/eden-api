import { TaskSchema } from '../../models/Task';
import { TaskHandlers } from '../../plugins/tasks';
import { FastifyInstance } from 'fastify';

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

  const model = await replicate.getModel('abraham-ai/eden-stable-diffusion')
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

const receiveTaskUpdate = async (update: any) => {
  const { id: taskId, status, output } = update as ReplicateWebhookUpdate;

  let updateData: Partial<TaskSchema> = {}

  switch (status) {
    case 'starting':
      // do nothing
      break;
    case 'processing':
      break;
    case 'succeeded':
      updateData = {
        taskId,
        status: 'completed',
        intermediateOutput: output || []
      }
      break;
    case 'failed' || 'cancelled':
      updateData = {
        taskId,
        status: 'failed',
        intermediateOutput: output || []
      }
      break;
    default:
      throw new Error(`Unknown status ${status}`);
    }

    console.log('heres the update data', updateData)

    return updateData
}


const create = async (server: FastifyInstance, generatorName: string, config: any) => {
  console.log(`Creating task for generator ${generatorName} with config ${JSON.stringify(config)}`);
  console.log(server)
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true"
}

export const replicateTaskHandlers: TaskHandlers = {
  submitTask,
  create,
  receiveTaskUpdate,
}