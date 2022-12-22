import { TaskHandlers } from '@/plugins/tasks';
import { formatStableDiffusionConfigForReplicate } from '@/types/generatorTypes';
import { FastifyInstance } from 'fastify';

const makeWebhookUrl = (server: FastifyInstance) => {
  return `${server.config.REPLICATE_WEBHOOK_URL}/model_update_replicate?secret=${server.config.REPLICATE_WEBHOOK_SECRET}`;
}

const submitTask = async (server: FastifyInstance, generatorId: string, config: any) => {
  const replicate = server.replicate;
  if (!replicate) {
    throw new Error('Replicate not initialized');
  }

  const webhookUrl = makeWebhookUrl(server);

  let model;
  try {
    model = await replicate.getModel(generatorId);
  } catch (e) {
    throw new Error(`Could not find model ${generatorId}`);
  }
  if (model.results.length === 0) {
    throw new Error(`Could not find model ${generatorId}`);
  }
  const modelId = model.results[0].id;
  const preparedConfig = formatStableDiffusionConfigForReplicate(config);
  // @ts-ignore
  const task = await replicate.startPrediction(modelId, preparedConfig, webhookUrl, ['start', 'output', 'completed']);
  return task.id
}

const create = async (server: FastifyInstance, generatorId: string, config: any) => {
  console.log(`Creating task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  console.log(server)
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true"
}

export const replicateTaskHandlers: TaskHandlers = {
  submitTask,
  create,
}