import { GeneratorVersionSchema } from "@/models/Generator";
import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { v4 as uuidv4 } from 'uuid';

interface adminCreateUserRequest extends FastifyRequest {
  body: {
    userId: string;
  }
}

export const adminCreateUser = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.body as adminCreateUserRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const user = await server.mongo.db.collection("users").findOne({
    userId,
  });

  if (user) {
    return reply.status(409).send({
      message: "User already exists",
    });
  }

  await server.mongo.db.collection("users").insertOne({
    userId,
    isWallet: false,
    isAdmin: false,
  });

  const apiKey = uuidv4();
  const apiSecret = uuidv4();

  await server.mongo.db.collection("apiKeys").insertOne({
    apiKey,
    apiSecret,
    userId,
  });

  return reply.status(200).send({
    userId,
    apiKey,
    apiSecret,
  });
};

interface RegisterGeneratorRequest extends FastifyRequest {
  body: {
    generatorId: string;
    versionId: string;
    defaultConfig: any;
  }
}

export const registerGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { generatorId, versionId, defaultConfig } = request.body as RegisterGeneratorRequest["body"];

  const generatorVersion: GeneratorVersionSchema = {
    versionId,
    defaultConfig,
    isDeprecated: false,
    createdAt: new Date(),
  }

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generator = await server.mongo.db.collection("generators").findOne({
    generatorId,
  });

  if (generator) {
    // Already exists, add new version
    await server.mongo.db.collection("generators").updateOne({
      generatorId,
    }, {
      $push: {
        versions: generatorVersion,
      },
    });
    return reply.status(200).send({
      generatorId,
      versionId,
    });
  }

  await server.mongo.db.collection("generators").insertOne({
    generatorId,
    versions: [generatorVersion],
  });

  return reply.status(200).send({
    generatorId,
    versionId,
  });
}

interface DeprecateGeneratorRequest extends FastifyRequest {
  body: {
    generatorId: string;
    versionId: string;
  }
}

export const deprecateGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { generatorId, versionId } = request.body as DeprecateGeneratorRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generator = await server.mongo.db.collection("generators").findOne({
    generatorId,
  });


  if (!generator) {
    return reply.status(404).send({
      message: "Generator not found",
    });
  }


  const versionIndex = generator.versions.findIndex((v: GeneratorVersionSchema) => v.versionId === versionId);


  if (versionIndex === -1) {
    return reply.status(404).send({
      message: "Generator version not found",
    });
  }

  await server.mongo.db.collection("generators").updateOne({
    generatorId,
  }, {
    $set: {
      [`versions.${versionIndex}.isDeprecated`]: true,
    },
  });

  return reply.status(200).send({
    generatorId,
    versionId,
  });
}