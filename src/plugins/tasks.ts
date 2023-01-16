import "dotenv/config";
import { FastifyInstance } from "fastify";
import { dummySubmitTask, dummyCreate, dummyReceiveTaskUpdate } from "../lib/taskHandlers/dummy";
import { TaskSchema } from "../models/Task";

export interface TaskHandlers {
  submitTask: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
  create: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
  receiveTaskUpdate: (server: FastifyInstance, update: any) => Promise<Partial<TaskSchema>>;
}

const dummyHandlers: TaskHandlers = {
  submitTask: dummySubmitTask,
  create: dummyCreate,
  receiveTaskUpdate: dummyReceiveTaskUpdate
}

export const registerTaskHandlers = (server: FastifyInstance, taskHandlers: TaskHandlers | undefined) => {
  const handlers = taskHandlers || dummyHandlers
  server.decorate("submitTask", handlers.submitTask);
  server.decorate("create", handlers.create);
  server.decorate("receiveTaskUpdate", handlers.receiveTaskUpdate);
} 

declare module "fastify" {
  interface FastifyInstance {
    submitTask: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
    create: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
    receiveTaskUpdate: (server: FastifyInstance, update: any) => Promise<Partial<TaskSchema>>;
  }
}
