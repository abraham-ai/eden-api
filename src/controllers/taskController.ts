import { getLatestGeneratorVersion, prepareConfig } from "../lib/generator";
import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { Task, TaskDocument, TaskSchema } from "../models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Manna } from "../models/Manna";
import { User } from "../models/User";
import { Transaction, TransactionSchema } from "../models/Transaction";

interface CreationRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId?: string;
    config?: any;
    metadata?: any;
  }
}

export const submitTask = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  // Get the generator. Use the versionId if provided, otherwise use the latest version
  const { generatorName, versionId, config, metadata } = request.body as CreationRequest["body"];

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
  const cost = request.user.isAdmin ? 0 : server.getTransactionCost(server, generatorVersion, preparedConfig)

  // get the user
  let user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: "User not found",
    });
  }

  // make sure user has enough manna
  let manna = await Manna.findOne({ user: user });

  // TODO: give free manna only to verified new users, not just unrecognized ones
  if (!manna) {
    console.log(`Creating manna for user ${userId} with balance 0`)
    manna = await Manna.create({
      user: user,
      balance: 500,
    });
  }

  if (manna.balance < cost) {
    return reply.status(400).send({
      message: "Not enough manna",
    });
  }
  
  // finally, submit the task
  const taskId = await server.submitTask(server, generatorVersion, preparedConfig)

  if (!taskId) {
    return reply.status(500).send({
      message: "Failed to submit task",
    });
  }

  const taskData: TaskSchema = {
    taskId,
    status: 'pending',
    user: user,
    generator: generator._id,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    metadata: metadata,
    cost: cost
  }

  const task = new Task(taskData);
  await task.save();

  const transactionData: TransactionSchema = {
    manna: manna._id,
    task: task._id,
    amount: -cost,
  }

  await Transaction.create(transactionData);

  manna.balance -= cost;
  await manna.save();

  return reply.status(200).send({
    taskId,
  });
}

export const fetchTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { taskId } = request.params as {taskId: string};  
  const task = await Task.find({taskId: taskId});  
  return reply.status(200).send({task});
}

interface FetchTasksRequest extends FastifyRequest {
  query: {
    status?: string,
    taskIds?: string[];
    userId?: string;
  }
}

export const fetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, status, taskIds } = request.body as FetchTasksRequest["query"] || {};

  let filter = {};
  filter = Object.assign(filter, userId ? { userId } : {});
  filter = Object.assign(filter, status ? { status } : {});
  
  if (taskIds) {    
    filter = Object.assign(filter, { taskId: { $in: taskIds } });
  }

  const tasks = await Task.find(filter);
  
  return reply.status(200).send({
    tasks,
  });
}

interface UserFetchTasksRequest {
  body: {
    status: string[];
    taskIds: string[];
    generators: string[];
    earliestTime: any;
    latestTime: any;
    limit: number;
  }
}


export const userFetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;
  const { status, taskIds, generators, earliestTime, latestTime, limit } = request.body as UserFetchTasksRequest["body"];

  let filter = {user: userId};  
  filter = Object.assign(filter, status ? { status: { $in: status } } : {});

  if (taskIds) {    
    filter = Object.assign(filter, { taskId: { $in: taskIds } });
  }

  if (earliestTime || latestTime) {
    Object.assign(filter, {
      createdAt: {
        ...(earliestTime ? { $gte: earliestTime } : {}),
        ...(latestTime ? { $lte: latestTime } : {}),
      },
    });
  }

  let tasks: TaskDocument[] = [];

  tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({
      path: 'generator',
      select: 'generatorName',
    }
  );

  if (generators && generators.length > 0) {
    tasks = tasks.filter((task) => {
      return task.generator && task.generator.generatorName &&
      generators.includes(task.generator.generatorName)
    });
  }

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
