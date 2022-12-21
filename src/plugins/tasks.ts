import "dotenv/config";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";

const dummySubmitTask = async (generatorId: string, config: any) => {
  console.log(`Submitting task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return uuidv4();
};

const dummyCreate = async (generatorId: string, config: any) => {
  console.log(`Creating task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return uuidv4();
};


const configPlugin: FastifyPluginAsync = async (server) => {
  server.decorate("submitTask", dummySubmitTask);
  server.decorate("create", dummyCreate);
};

declare module "fastify" {
  interface FastifyInstance {
    submitTask: (generatorId: string, config: any) => Promise<string>;
  }
}

export default fp(configPlugin);
