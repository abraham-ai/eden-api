import { FastifyInstance } from 'fastify';

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
  
  return task;
}

const submitAndWaitForTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  console.log(`Creating task for generator ${generatorVersion.versionId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true"
}

const getTransactionCost = (_: FastifyInstance, __: any, config: any) => {
  if ( config.n_frames ) {
    return config.n_frames;
  } else {
    return 1;
  }
}

export {
  submitTask,
  submitAndWaitForTask,
  getTransactionCost,
}