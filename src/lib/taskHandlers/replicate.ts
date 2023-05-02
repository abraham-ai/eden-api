import { FastifyInstance } from 'fastify';
import { Lora } from '../../models/Lora';


const makeWebhookUrl = (server: FastifyInstance) => {
  return `${server.config.WEBHOOK_URL}/tasks/update?secret=${server.config.WEBHOOK_SECRET}`;
}

export const formatStableDiffusionConfigForReplicate = async (config: any) => {
  let newConfig = {...config};
  
  // if no text input, use interpolation texts
  if (!newConfig.text_input) {
    newConfig.text_input = newConfig.interpolation_texts?.join(" to ") || "Untitled";
  }
  
  // convert lists into |-separated strings
  newConfig.interpolation_texts ? newConfig.interpolation_texts = newConfig.interpolation_texts.join("|") : null;
  newConfig.interpolation_seeds ? newConfig.interpolation_seeds = newConfig.interpolation_seeds.join("|") : null;
  newConfig.interpolation_init_images ? newConfig.interpolation_init_images = newConfig.interpolation_init_images.join("|") : null;
  newConfig.voice_file_urls ? newConfig.voice_file_urls = newConfig.voice_file_urls.join("|") : null;
  newConfig.lora_training_urls ? newConfig.lora_training_urls = newConfig.lora_training_urls.join("|") : null;

  // if it's a LORA training
  if (newConfig.lora_training_urls) {

    // remove any spaces, pipes, or underscores in the name
    newConfig.name = newConfig.name.replace(/ /g, '');
    newConfig.name = newConfig.name.replace(/\|/g, '');
    newConfig.name = newConfig.name.replace(/_/g, '');

    // version the name (v2, v3, etc)
    const loras = await Lora.find({name: newConfig.name});
    if (loras.length > 0) {
      const baseName = newConfig.name;
      let version = 2;
      let newName = `${baseName}_v${version}`;
      while (await Lora.findOne({name: newName})) {
        version++;
        newName = `${baseName}_v${version}`;
      }
      newConfig.name = newName;
    }

    // set placeholder token to name
    newConfig.placeholder_tokens = `<${newConfig.name}>`;
  }

  // if it's a LORA inference, get the LORA url
  if (newConfig.lora == '(none)') {
    delete newConfig.lora;
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
    if (task.status == 422) {
      throw new Error(task.detail);
    }    
    return task;  
  } catch (error) {
    throw new Error(`${error}`);
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