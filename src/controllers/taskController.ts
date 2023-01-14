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
    generator: generator._id,
    user: userId,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    intermediateOutput: [],
    output: [],
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

  let update = await server.receiveTaskUpdate(request.body);

  const task = await Task.findOne({
    taskId: update.taskId,
  });

  if (!task) {
    return reply.status(404).send({
      message: "Task not found",
    });
  }

  if (update.intermediateOutput) {
    // compare against the existing intermediate output, and use server.minio to upload the new files
    // then update the intermediate output in the database
    const newIntermediateOutput = update.intermediateOutput.filter((url: string) => {
      return !task.intermediateOutput.includes(url);
    });
    const shas = newIntermediateOutput.map(async (url: string) => {
      console.log('Uploading', url);
      const sha = await server.uploadUrlAsset!(server, url);
      return sha;
    });
    const newShas = await Promise.all(shas);
    update.output = [...task.output, ...newShas];
  }


  await Task.updateOne({
    taskId: update.taskId,
  }, update);
}
