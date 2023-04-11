import { FastifyInstance } from 'fastify';
import { randomId } from "../../lib/util";
import { receiveTaskUpdate } from "./taskHandler";

const submitTask = async (server: FastifyInstance, generatorVersion: any, config: any) => {
  const task = {id: randomId(24)};
  setTimeout(async () => {
    await runTask(server, task, generatorVersion, config);
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

const runTask = async (server: FastifyInstance, task: any, generatorVersion: any, config: any) => {
  console.log(`Running task ${task.id} for generator ${generatorVersion.versionId} with config ${JSON.stringify(config)}`);
  
  const llm = server.llm;
  if (!llm) {
    throw new Error('Llm not initialized');
  }

  const completion = await llm.createCompletion({
    model: "text-davinci-003",
    prompt: config.prompt,
    temperature: 0.9,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0.15,
    presence_penalty: 0.1
  });

  const result = completion.data.choices[0].text;
  
  const output = {
    result: result,
    isFinal: true
  };

  const update = {
    id: task.id,
    status: 'processing',
    progress: 1,
    output: output,
    error: null,
  }

  await receiveTaskUpdate(server, update);
}

export {
  submitTask,
  submitAndWaitForTask,
  getTransactionCost,
}