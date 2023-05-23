import { getLatestGeneratorVersion, prepareConfig } from "../lib/generator";
import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { Task, TaskDocument, TaskSchema } from "../models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Manna } from "../models/Manna";
import { User } from "../models/Creator";
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
  const { generatorName, versionId, config, metadata } = request.body as CreationRequest["body"];

  // get generator
  const generator = await Generator.findOne({
    generatorName,
  });
  if (!generator) {
    const generatorNames = await Generator.find().distinct("generatorName");
    return reply.status(400).send({
      message: `Generator ${generatorName} not found. Options are (${generatorNames.join(', ')})`,
    });
  }
  
  // use versionId if provided else latest
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

  // get user
  const user = await User.findById(userId);
  if (!user) {
    return reply.status(400).send({
      message: "User not found",
    });
  }

  console.log(`===== User ${user._id} requested ${JSON.stringify(config)} ===== \n`)

  // validate config, add defaults
  const preparedConfig = prepareConfig(generatorVersion.parameters, config);
  
  console.log(`--- Prepared config ${JSON.stringify(preparedConfig)} ===== \n`)

  // check if user has enough manna
  const manna = await Manna.findOne({user});
  if (!manna) {
    return reply.status(401).send({
      message: "User has no manna",
    });
  }

  const cost = server.getTransactionCost(server, generatorVersion, preparedConfig);
  if (manna.balance < cost) {
    return reply.status(401).send({
      message: "Not enough manna",
    });
  }
  
  // submit task
  const taskId = await server.submitTask(server, generatorVersion, preparedConfig)
  console.log(`--- Submitted task ${taskId} ===== \n`)
  if (!taskId) {
    return reply.status(500).send({
      message: "Failed to submit task",
    });
  }

  // update db
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

  // charge user manna
  manna.balance -= cost;
  await manna.save();

  return reply.status(200).send({taskId});
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
  
  return reply.status(200).send({tasks});
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

  return reply.status(200).send({tasks});
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
