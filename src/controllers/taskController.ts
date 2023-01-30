import { getLatestGeneratorVersion, prepareConfig } from "../lib/generator";
import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { Task, TaskSchema } from "../models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Credit } from "../models/Credit";
import { Transaction, TransactionSchema } from "../models/Transaction";

interface FetchTasksRequest extends FastifyRequest {
  query: {
    status?: string,
    taskIds?: string[];
    userId?: string;
  }
}

interface UserFetchTasksRequest extends FastifyRequest {
  query: {
    status?: string,
    taskIds?: string;
  }
}

export const fetchTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { taskId } = request.params as {taskId: string};
  
  const task = await Task.findById(taskId);
  
  return reply.status(200).send({task});
}

export const fetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, status, taskIds } = request.body as FetchTasksRequest["query"] || {};

  let filter = {};
  filter = Object.assign(filter, userId ? { userId } : {});
  filter = Object.assign(filter, status ? { status } : {});
  
  if (taskIds) {    
    filter = Object.assign(filter, { _id: { $in: taskIds } });
  }

  const tasks = await Task.find(filter);

  return reply.status(200).send({
    tasks,
  });
}

export const userFetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;
  const { status, taskIds } = request.body as UserFetchTasksRequest["query"] || {};

  let filter = {user: userId};  
  filter = Object.assign(filter, status ? { status } : {});
  filter = Object.assign(filter, taskIds ? { _id: { $in: taskIds } } : {});

  const tasks = await Task.find(filter);

  return reply.status(200).send({
    tasks,
  });
}

interface ReceiveTaskUpdateRequest extends FastifyRequest {
  query: {
    secret: string;
  }
}

export const receiveTaskUpdate = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {

  const { secret } = request.query as ReceiveTaskUpdateRequest["query"];

  if (secret !== server.config.WEBHOOK_SECRET) {
    return reply.status(401).send({
      message: "Invalid webhook secret"
    });
  }

  await server.receiveTaskUpdate(server, request.body);
}

interface CreationRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId?: string;
    config?: any;
  }
}

export const submitTask = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  // Get the generator. Use the versionId if provided, otherwise use the latest version
  const { generatorName, versionId, config } = request.body as CreationRequest["body"];
  const generator = await Generator.findOne({
    generatorName,
  });

  if (!generator) {
    return reply.status(400).send({
      message: "Generator not found",
    });
  }

  let generatorVersion;

  if (versionId) {
    const version = generator.versions.find((v: GeneratorVersionSchema) => v.versionId === versionId);
    if (!version) {
      return reply.status(400).send({
        message: "Generator version not found",
      });
    }
    generatorVersion = version;
  } else {
    generatorVersion = getLatestGeneratorVersion(generator)
  }

  // Validate the config against the generator version's schema
  const preparedConfig = prepareConfig(generatorVersion.parameters, config);

  // get the transaction cost
  const cost = request.user.isAdmin ? 0 : server.getTransactionCost(server, generatorName, preparedConfig)

  // make sure user has enough credits
  let credit = await Credit.findOne({ user: userId });

  // TODO: give free credits only to verified new users, not just unrecognized ones
  if (!credit) {
    console.log(`Creating credit for user ${userId} with balance 0`)
    credit = await Credit.create({
      user: userId,
      balance: 100,
    });
  }

  if (credit.balance < cost) {
    return reply.status(400).send({
      message: "Not enough credits",
    });
  }

  // finally, submit the task and re
  const taskId = await server.submitTask(server, generatorName, preparedConfig)

  if (!taskId) {
    return reply.status(500).send({
      message: "Failed to submit task",
    });
  }

  const taskData: TaskSchema = {
    taskId,
    status: 'pending',
    user: userId,
    generator: generator._id,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    cost
  }

  const task = new Task(taskData);
  await task.save();

  const transactionData: TransactionSchema = {
    credit: credit._id,
    task: task._id,
    amount: -cost,
  }

  await Transaction.create(transactionData);

  credit.balance -= cost;
  await credit.save();

  return reply.status(200).send({
    taskId,
  });
}
