import { FastifyInstance } from 'fastify';
import { receiveTaskUpdate } from "./taskHandler";

const submitTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  
  const tts = server.tts;
  if (!tts) {
    throw new Error('Tts not initialized');
  }

  const taskId = await tts.startTask(config.voice, config.text);
  const task =  {id: taskId};
  
  setTimeout(async () => {
    await pollTaskUntilDone(server, task);
  }, 0);

  return task;
}

const submitAndWaitForTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  console.log(`Creating task for generator ${generatorVersion.versionId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "true";
}

const getTransactionCost = (_: FastifyInstance, __: any, config: any) => {
  return 1;
}

const pollTaskUntilDone = async (server: FastifyInstance, task: any) => {
  const tts = server.tts;
  if (!tts) {
    throw new Error('Tts not initialized');
  }

  let audioUrl = await tts.pollForTask(2000, task.id);

  console.log("FINALLY GOT THE URL!!!", audioUrl)

  const output = {
    file: audioUrl,
    name: task.id+".wav",
    isFinal: true
  };

  console.log("OUTPUT", output)

  const update = {
    id: task.id,
    status: 'processing',
    progress: 1,
    output: output,
    error: null,
  }

  console.log("the update will be", update)

  await receiveTaskUpdate(server, update);
}

export {
  submitTask,
  submitAndWaitForTask,
  getTransactionCost,
}