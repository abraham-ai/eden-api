import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";

export const dummySubmitTask = async (_: FastifyInstance, generatorName: string, config: any) => {
  console.log(`Submitting task for generator ${generatorName} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return uuidv4();
};

export const dummyCreate = async (_: FastifyInstance, generatorName: string, config: any) => {
  console.log(`Creating task for generator ${generatorName} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return uuidv4();
};

export const dummyReceiveTaskUpdate = async (server: FastifyInstance, update: any) => {
  console.log(`Received update ${JSON.stringify(update)}`);
  return update;
}