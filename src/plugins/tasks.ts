import "dotenv/config";
import { FastifyInstance } from "fastify";
import { dummySubmitTask, dummyCreate, dummyReceiveTaskUpdate, dummyGetTransactionCost } from "../lib/taskHandlers/dummy";

export interface TaskHandlers {
  submitTask: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
  create: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
  receiveTaskUpdate: (server: FastifyInstance, update: any) => void;
  getTransactionCost: (server: FastifyInstance, generatorName: string, config: any) => number
}

const dummyHandlers: TaskHandlers = {
  submitTask: dummySubmitTask,
  create: dummyCreate,
  receiveTaskUpdate: dummyReceiveTaskUpdate,
  getTransactionCost: dummyGetTransactionCost,
}

export const registerTaskHandlers = (server: FastifyInstance, taskHandlers: TaskHandlers | undefined) => {
  const handlers = taskHandlers || dummyHandlers
  server.decorate("submitTask", handlers.submitTask);
  server.decorate("create", handlers.create);
  server.decorate("receiveTaskUpdate", handlers.receiveTaskUpdate);
  server.decorate("getTransactionCost", handlers.getTransactionCost);
} 

declare module "fastify" {
  interface FastifyInstance {
    submitTask: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
    create: (server: FastifyInstance, generatorName: string, config: any) => Promise<string>;
    receiveTaskUpdate: (server: FastifyInstance, update: any) => void;
    getTransactionCost: (server: FastifyInstance, generatorName: string, config: any) => number
  }
}
