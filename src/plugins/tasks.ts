import "dotenv/config";
import { FastifyInstance } from "fastify";
import { dummySubmitTask, dummyCreate } from "@/lib/taskHandlers/dummy";

export interface TaskHandlers {
  submitTask: (generatorId: string, config: any) => Promise<string>;
  create: (generatorId: string, config: any) => Promise<string>;
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
    submitTask: (generatorId: string, config: any) => Promise<string>;
    create: (generatorId: string, config: any) => Promise<string>;
  }
}
