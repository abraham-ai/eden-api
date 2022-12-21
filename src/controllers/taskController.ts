import { getLatestGeneratorVersion, prepareConfig } from "@/lib/generator";
import { GeneratorDocument, GeneratorVersionSchema } from "@/models/Generator";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

interface CreationRequest extends FastifyRequest {
  body: {
    generatorId: string;
    versionId?: string;
    config?: any;
  }
}

export const requestCreation = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  // Get the generator. Use the versionId if provided, otherwise use the latest version
  const { generatorId, versionId, config } = request.body as CreationRequest["body"];
  const generator = await server.mongo.db.collection("generators").findOne({
    generatorId: generatorId,
  }) as GeneratorDocument;

  if (!generator) {
    return reply.status(404).send({
      message: "Generator not found",
    });
  }

  let generatorVersion;

  if (versionId) {
    const version = generator.versions.find((v: GeneratorVersionSchema) => v.versionId === versionId);
    if (!version) {
      return reply.status(404).send({
        message: "Generator version not found",
      });
    }
    generatorVersion = version;
  } else {
    generatorVersion = getLatestGeneratorVersion(generator)
  }

  // Validate the config against the generator version's schema
  const preparedConfig = prepareConfig(config, generatorVersion.defaultConfig);

  // finally, submit the task and re
  const taskId = await server.submitTask(generatorId, preparedConfig)
  return reply.status(200).send({
    taskId,
  });
};

export const fetchTasks = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    message: "Creations fetched",
  });
}

export const create = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    message: "Creation created",
  });
}
