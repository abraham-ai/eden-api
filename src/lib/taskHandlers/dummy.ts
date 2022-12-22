import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";

export const dummySubmitTask = async (server: FastifyInstance, generatorId: string, config: any) => {
  console.log(`Submitting task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  console.log(server);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return uuidv4();
};

export const dummyCreate = async (server: FastifyInstance, generatorId: string, config: any) => {
  console.log(`Creating task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  console.log(server);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return uuidv4();
};