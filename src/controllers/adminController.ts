import { GeneratorVersion } from "@/models/Generator";
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
    service: string;
    name: string;
    version: string;
  }
}

export const registerGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { service, name, version } = request.body as RegisterGeneratorRequest["body"];

  const generatorVersion: GeneratorVersion = {
    versionId: version,
    isDeprecated: false,
    createdAt: new Date(),
  }

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generator = await server.mongo.db.collection("generators").findOne({
    service,
    name,
  });

  if (generator) {
    // Already exists, add new version
    await server.mongo.db.collection("generators").updateOne({
      service,
      name,
    }, {
      $push: {
        versions: generatorVersion,
      },
    });
    return reply.status(200).send({
      service,
      name,
      version,
    });
  }

  await server.mongo.db.collection("generators").insertOne({
    service,
    name,
    versions: [generatorVersion],
  });

  return reply.status(200).send({
    service,
    name,
    version,
  });
}

interface DeprecateGeneratorRequest extends FastifyRequest {
  body: {
    service: string;
    name: string;
    version: string;
  }
}

export const deprecateGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { service, name, version } = request.body as DeprecateGeneratorRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generator = await server.mongo.db.collection("generators").findOne({
    service,
    name,
  });

  if (!generator) {
    return reply.status(404).send({
      message: "Generator not found",
    });
  }

  const versionIndex = generator.versions.findIndex((v: GeneratorVersion) => v.versionId === version);

  if (versionIndex === -1) {
    return reply.status(404).send({
      message: "Generator version not found",
    });
  }

  await server.mongo.db.collection("generators").updateOne({
    service,
    name,
  }, {
    $set: {
      [`versions.${versionIndex}.isDeprecated`]: true,
    },
  });

  return reply.status(200).send({
    service,
    name,
    version,
  });
}