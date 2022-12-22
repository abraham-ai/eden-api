import { getLatestGeneratorVersion, prepareConfig } from "@/lib/generator";
import { GeneratorDocument, GeneratorVersionSchema } from "@/models/Generator";
import { TaskSchema } from "@/models/Task";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface CreationRequest extends FastifyRequest {
  body: {
    generatorId: string;
    versionId?: string;
    config?: any;
    metadata?: any;
  }
}

export const submitTask = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  // Get the generator. Use the versionId if provided, otherwise use the latest version
  const { generatorId, versionId, config, metadata } = request.body as CreationRequest["body"];
  const generator = await server.mongo.db.collection("generators").findOne({
    generatorId: generatorId,
  }) as GeneratorDocument;

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
  const preparedConfig = prepareConfig(generatorVersion.defaultConfig, config);

  // finally, submit the task and re
  const taskId = await server.submitTask(server, generatorId, preparedConfig)

  if (!taskId) {
    return reply.status(500).send({
      message: "Failed to submit task",
    });
  }

  const taskData: TaskSchema = {
    taskId,
    status: 'pending',
    generatorId,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    metadata,
    intermediateOutput: [],
    output: [],
  }

  await server.mongo.db.collection("tasks").insertOne(taskData)

  return reply.status(200).send({
    taskId,
  });
};

interface FetchTasksRequest extends FastifyRequest {
  body: {
    taskIds: string[];
  }
}


export const fetchTasks = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const { taskIds } = request.body as FetchTasksRequest["body"];

  const tasks = await server.mongo.db.collection("tasks").find({
    taskId: {
      $in: taskIds,
    },
  }).toArray();


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
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const { secret } = request.query as ReceiveTaskUpdateRequest["query"];

  if (secret !== server.config.WEBHOOK_SECRET) {
    return reply.status(401).send({
      message: "Invalid webhook secret"
    });
  }

  const update = await server.receiveTaskUpdate(request.body);

  const task = await server.mongo.db.collection("tasks").findOne({
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

  await server.mongo.db.collection("tasks").updateOne({
    taskId: update.taskId,
  }, {
    $set: update,
  })
}
