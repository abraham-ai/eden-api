import "dotenv/config";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { v4 as uuidv4 } from "uuid";

const dummySubmitTask = async (generatorId: string, config: any) => {
  console.log(`Submitting task for generator ${generatorId} with config ${JSON.stringify(config)}`);
  return uuidv4();
};

const configPlugin: FastifyPluginAsync = async (server) => {
  server.decorate("submitTask", dummySubmitTask);
};

declare module "fastify" {
  interface FastifyInstance {
    submitTask: (generatorId: string, config: any) => Promise<string>;
  }
}

export default fp(configPlugin);
