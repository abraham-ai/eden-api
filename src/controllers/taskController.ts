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
  const taskId = await server.submitTask(generatorId, preparedConfig)

  if (!taskId) {
    return reply.status(500).send({
      message: "Failed to submit task",
    });
  }

  const taskData: TaskSchema = {
    taskId,
    status: 'submitted',
    generatorId,
    versionId: generatorVersion.versionId,
    config: preparedConfig,
    metadata,
  }

  await server.mongo.db.collection("tasks").insertOne(taskData);

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