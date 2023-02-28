import { FastifyInstance } from 'fastify';

import { Lora } from '../../models/Lora';


const makeWebhookUrl = (server: FastifyInstance) => {
  return `${server.config.WEBHOOK_URL}/tasks/update?secret=${server.config.WEBHOOK_SECRET}`;
}

export const formatStableDiffusionConfigForReplicate = async (config: any) => {
  let newConfig = {...config};
  
  // convert lists into |-separated strings
  newConfig.interpolation_texts ? newConfig.interpolation_texts = newConfig.interpolation_texts.join("|") : null;
  newConfig.interpolation_seeds ? newConfig.interpolation_seeds = newConfig.interpolation_seeds.join("|") : null;
  newConfig.interpolation_init_images ? newConfig.interpolation_init_images = newConfig.interpolation_init_images.join("|") : null;
  newConfig.voice_file_urls ? newConfig.voice_file_urls = newConfig.voice_file_urls.join("|") : null;
  newConfig.lora_training_urls ? newConfig.lora_training_urls = newConfig.lora_training_urls.join("|") : null;

  // if it's a LORA training, set placeholder token to name
  if (newConfig.lora_training_urls) {
    newConfig.placeholder_tokens = `<${newConfig.name}>`;
  }

  // if it's a LORA inference, get the LORA url
  if (newConfig.lora == '(none)') {
    newConfig.lora = null;
  }
  else if (newConfig.lora) {
    const lora = await Lora.findOne({name: newConfig.lora});
    if (!lora) {
      throw new Error(`Could not find Lora ${newConfig.lora}`);
    }
    newConfig.lora = lora.uri;
  }
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

  try {
    let preparedConfig = await formatStableDiffusionConfigForReplicate(config);
    preparedConfig.mode = generatorVersion.mode;
    // @ts-ignore
    const task = await replicate.startPrediction(modelId, preparedConfig, webhookUrl, ['start', 'output', 'completed']);
    return task;
  } catch (error) {
    throw new Error(`Could not create task. ${error}`);
  }
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