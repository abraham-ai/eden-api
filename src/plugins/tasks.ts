import "dotenv/config";
import { FastifyInstance } from "fastify";
import { GeneratorVersionSchema } from "../models/Generator";
import { dummySubmitTask, dummySubmitAndWaitForTask, dummyReceiveTaskUpdate, dummyGetTransactionCost } from "../lib/taskHandlers/dummy";

export interface TaskHandlers {
  submitAndWaitForTask: (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => Promise<string>;
  submitTask:           (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => Promise<string>;
  receiveTaskUpdate:    (server: FastifyInstance, update: any) => void;
  getTransactionCost:   (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => number
}

const dummyHandlers: TaskHandlers = {
  submitAndWaitForTask: dummySubmitAndWaitForTask,
  submitTask: dummySubmitTask,
  receiveTaskUpdate: dummyReceiveTaskUpdate,
  getTransactionCost: dummyGetTransactionCost,
}

export const registerTaskHandlers = (server: FastifyInstance, taskHandlers: TaskHandlers | undefined) => {
  const handlers = taskHandlers || dummyHandlers
  server.decorate("submitAndWaitForTask", handlers.submitAndWaitForTask);
  server.decorate("submitTask", handlers.submitTask);
  server.decorate("receiveTaskUpdate", handlers.receiveTaskUpdate);
  server.decorate("getTransactionCost", handlers.getTransactionCost);
} 

declare module "fastify" {
  interface FastifyInstance {
    submitAndWaitForTask: (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => Promise<string>;
    submitTask:           (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => Promise<string>;
    receiveTaskUpdate:    (server: FastifyInstance, update: any) => void;
    getTransactionCost:   (server: FastifyInstance, generatorVersion: GeneratorVersionSchema, config: any) => number
  }
}
