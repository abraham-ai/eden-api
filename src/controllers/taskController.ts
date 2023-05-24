import { getLatestGeneratorVersion, prepareConfig } from "../lib/generator";
import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { Task, TaskSchema } from "../models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Manna } from "../models/Manna";
import { User } from "../models/Creator";
import { Transaction, TransactionSchema } from "../models/Transaction";
import { TaskCreateBody, TaskGetParams, TaskUpdateQuery, TasksGetQuery } from "../routes/taskRoutes";

export const createTask = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { generatorName, versionId, config, metadata } = request.body as TaskCreateBody

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

  // validate config, add defaults
  const preparedConfig = prepareConfig(generatorVersion.parameters, config);
  
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

export const getTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { taskId } = request.params as TaskGetParams
  const task = await Task.findOne({taskId: taskId});  
  return reply.status(200).send({task});
}

export const getTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const taskFilter = request.query as TasksGetQuery
  let user
  if (taskFilter.userId) {
    try {
      user = await User.findOne({userId: taskFilter.userId});
    } catch (err) {
      return reply.status(400).send({
        message: "Invalid userId",
      });
    }
  }

  const query = {
    ...(taskFilter.status && {status: taskFilter.status}),
    ...(taskFilter.taskIds && {taskId: {$in: taskFilter.taskIds}}),
    ...(user && {user: user._id}),
    ...(taskFilter.generators && {generator: {$in: taskFilter.generators}}),
    ...(taskFilter.earliestTime && {createdAt: {$gte: taskFilter.earliestTime}}),
    ...(taskFilter.latestTime && {createdAt: {$lte: taskFilter.latestTime}}),
  }

  const tasks = await Task.find(query).sort({ createdAt: -1 })
  .limit(taskFilter.limit || 100)
  .populate({
    path: 'generator',
    select: 'generatorName',
  }
);
  
  return reply.status(200).send({tasks});
}

export const receiveTaskUpdate = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { secret } = request.query as TaskUpdateQuery

  if (secret !== server.config.WEBHOOK_SECRET) {
    return reply.status(401).send({
      message: "Invalid webhook secret"
    });
  }

  await server.receiveTaskUpdate(server, request.body);
}
