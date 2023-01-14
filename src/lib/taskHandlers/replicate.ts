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

export const formatStableDiffusionConfigForReplicate = (config: any) => {
  const c = JSON.parse(JSON.stringify(config));
  if (c.translation) {
    c['translation_x'] = c['translation'][0];
    c['translation_y'] = c['translation'][1];
    c['translation_z'] = c['translation'][2];
    c['rotation_x'] = c['rotation'][0];
    c['rotation_y'] = c['rotation'][1];
    c['rotation_z'] = c['rotation'][2];
    c['interpolation_texts'] = c['interpolation_texts'].join("|")
    c['interpolation_seeds'] = c['interpolation_seeds'].join("|")
    c['interpolation_init_images'] = c['interpolation_init_images'].join("|")
    c['init_image_file'] = c['init_image_file'] || null;
    c['mask_image_file'] = c['mask_image_file'] || null;
    c['init_video'] = c['mask_image_file'] || null;
    delete c['translation'];
    delete c['rotation'];
    if (!c['init_image_file']) {
      delete c['init_image_file'];
    }
    if (!c['mask_image_file']) {
      delete c['mask_image_file'];
    }
    if (!c['init_video']) {
      delete c['init_video'];
    }
  }
  return c;
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
  const preparedConfig = formatStableDiffusionConfigForReplicate(config);
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
      updateData = {
        taskId,
        status: 'pending',
        intermediateOutput: output || []
      }
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