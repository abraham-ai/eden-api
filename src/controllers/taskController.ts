import { getLatestGeneratorVersion, prepareConfig } from "../lib/generator";
import { Generator, GeneratorVersionSchema } from "../models/Generator";
import { Task, TaskSchema } from "../models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

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
  const preparedConfig = prepareConfig(generatorVersion.defaultParameters, config);

  // get the transaction cost
  const cost = request.user.isAdmin ? 0 : server.getTransactionCost(server, generatorName, preparedConfig)

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
  }

  const task = new Task(taskData);
  await task.save();

  return reply.status(200).send({
    taskId,
  });
};

interface FetchTasksRequest extends FastifyRequest {
  body: {
    taskIds: string[];
  }
}


export const fetchTasks = async (request: FastifyRequest, reply: FastifyReply) => {

  const { taskIds } = request.body as FetchTasksRequest["body"];

  const tasks = await Task.find({
    taskId: {
      $in: taskIds,
    },
  });

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
