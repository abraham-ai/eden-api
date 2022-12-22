import "dotenv/config";
import { FastifyInstance } from "fastify";
import { dummySubmitTask, dummyCreate } from "@/lib/taskHandlers/dummy";

export interface TaskHandlers {
  submitTask: (server: FastifyInstance, generatorId: string, config: any) => Promise<string>;
  create: (server: FastifyInstance, generatorId: string, config: any) => Promise<string>;
}

const dummyHandlers: TaskHandlers = {
  submitTask: dummySubmitTask,
  create: dummyCreate
}

export const registerTaskHandlers = (server: FastifyInstance, taskHandlers: TaskHandlers | undefined) => {
  const handlers = taskHandlers || dummyHandlers
  server.decorate("submitTask", handlers.submitTask);
  server.decorate("create", handlers.create);
} 

declare module "fastify" {
  interface FastifyInstance {
    submitTask: (server: FastifyInstance, generatorId: string, config: any) => Promise<string>;
    create: (server: FastifyInstance, generatorId: string, config: any) => Promise<string>;
  }
}
