import { getLatestGeneratorVersion, prepareConfig } from '../lib/generator';
import { Generator, GeneratorVersionSchema } from '../models/Generator';
import { Task, TaskDocument, TaskSchema } from '../models/Task';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Manna } from '../models/Manna';
import { User } from '../models/User';
import { Transaction, TransactionSchema } from '../models/Transaction';
import * as Sentry from '@sentry/node';
import { ApiError } from '../models/errors/ApiError';

interface CreationRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId?: string;
    config?: any;
    metadata?: any;
  };
}

export const submitTask = async (
  server: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const transaction = Sentry.startTransaction({ name: 'submitTask' });
  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

  const { userId } = request.user;
  const { generatorName, versionId, config, metadata } = request.body as CreationRequest['body'];

  // get generator
  const generator = await Generator.findOne({
    generatorName,
  });

  if (!generator) {
    const generatorNames = await Generator.find().distinct('generatorName');
    const message = `Generator ${generatorName} not found: options are ${generatorNames.join(
      ', ',
    )}"`;
    throw new ApiError(message, { statusCode: 400 });
  }

  // use versionId if provided else latest
  let generatorVersion;
  if (versionId) {
    const version = generator.versions.find(
      (v: GeneratorVersionSchema) => v.versionId === versionId,
    );
    const message = 'Generator version not found';
    if (!version) {
      throw new ApiError(message, { statusCode: 400 });
    }
    generatorVersion = version;
  } else {
    generatorVersion = getLatestGeneratorVersion(generator);
  }

  // get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', { statusCode: 400 });
  }

  console.log(`===== User ${user._id} requested ${JSON.stringify(config)} ===== \n`);

  // validate config, add defaults
  const preparedConfig = prepareConfig(generatorVersion.parameters, config);
  
  console.log(`--- Prepared config ${JSON.stringify(preparedConfig)} ===== \n`)

  // check if user has enough manna
  const manna = await Manna.findOne({ user });
  if (!manna) {
    throw new ApiError('User has no manna', { statusCode: 401 });
  }

  const cost = server.getTransactionCost(server, generatorVersion, preparedConfig);
  if (manna.balance < cost) {
    throw new ApiError('Not enough manna', { statusCode: 401 });
  }

  // submit task
  var taskId;
  var apiErrorOptions = {
    userId: userId,
    generatorName: generatorName,
  };

  const span = transaction.startChild({
    data: {
      preparedConfig,
    },
    op: 'task',
    description: `Processing task for ${generatorName}`,
  });

  try {
    taskId = await server.submitTask(server, generatorVersion, preparedConfig);
  } catch (err) {
    throw new ApiError(
      `Failed to submit the following ${generatorName} job for user: ${userId}`,
      apiErrorOptions,
    );
  } finally {
    span.finish();
  }
  if (!taskId) {
    throw new ApiError(`Error in generating taskId`, apiErrorOptions);
  }
  
  if (!taskId) {
    throw new ApiError(`Error in generating taskId`, apiErrorOptions);
  }

  console.log(`--- Submitted task ${taskId} ===== \n`)

  // update db
  const taskData: TaskSchema = {
    taskId,
    status: 'pending',
    user: user,
    generator: generator._id,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    metadata: metadata,
    cost: cost,
  };
  const task = new Task(taskData);
  await task.save();

  const transactionData: TransactionSchema = {
    manna: manna._id,
    task: task._id,
    amount: -cost,
  };
  await Transaction.create(transactionData);

  // charge user manna
  manna.balance -= cost;
  await manna.save();

  // throw new TaskError("This is a test error", {taskId: "123", generatorName: "testGenerate"});
  
  transaction.finish();

  return reply.status(200).send({ taskId });
};

export const fetchTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const transaction = Sentry.startTransaction({ name: 'fetchTask' });
  const { taskId } = request.params as { taskId: string };
  const task = await Task.find({ taskId: taskId });
  transaction.finish();
  return reply.status(200).send({ task });
};

interface FetchTasksRequest extends FastifyRequest {
  query: {
    status?: string;
    taskIds?: string[];
    userId?: string;
  };
}

export const fetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const transaction = Sentry.startTransaction({ name: 'fetchTasks' });
  const { userId, status, taskIds } = (request.body as FetchTasksRequest['query']) || {};

  let filter = {};
  filter = Object.assign(filter, userId ? { userId } : {});
  filter = Object.assign(filter, status ? { status } : {});

  if (taskIds) {
    filter = Object.assign(filter, { taskId: { $in: taskIds } });
  }

  const tasks = await Task.find(filter);
  transaction.finish();

  return reply.status(200).send({ tasks });
};

interface UserFetchTasksRequest {
  body: {
    status: string[];
    taskIds: string[];
    generators: string[];
    earliestTime: any;
    latestTime: any;
    limit: number;
  };
}

export const userFetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const transaction = Sentry.startTransaction({ name: 'userFetchTasks' });
  const userId = request.user.userId;
  const { status, taskIds, generators, earliestTime, latestTime, limit } =
    request.body as UserFetchTasksRequest['body'];

  let filter = { user: userId };
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

  tasks = await Task.find(filter).sort({ createdAt: -1 }).limit(limit).populate({
    path: 'generator',
    select: 'generatorName',
  });

  if (generators && generators.length > 0) {
    tasks = tasks.filter((task) => {
      return (
        task.generator &&
        task.generator.generatorName &&
        generators.includes(task.generator.generatorName)
      );
    });
  }

  transaction.finish();
  return reply.status(200).send({ tasks });
};

interface ReceiveTaskUpdateRequest extends FastifyRequest {
  query: {
    secret: string;
  };
}

export const receiveTaskUpdate = async (
  server: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const transaction = Sentry.startTransaction({ name: 'receiveTaskUpdate' });
  const { secret } = request.query as ReceiveTaskUpdateRequest['query'];

  if (secret !== server.config.WEBHOOK_SECRET) {
    return reply.status(401).send({
      message: 'Invalid webhook secret',
    });
  }

  await server.receiveTaskUpdate(server, request.body);

  transaction.finish();
};
