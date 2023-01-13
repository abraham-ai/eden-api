import { GeneratorVersionDocument, GeneratorVersionSchema } from "../models/Generator";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export const listGenerators = async (server: FastifyInstance, reply: FastifyReply) => {
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generators = await server.mongo.db.collection("generators").find({}).toArray();
  const responseObj = generators.map((generator) => {
    return {
      generatorName: generator.generatorName,
      versions: generator.versions
      .filter((version: GeneratorVersionDocument) => !version.isDeprecated)
      .map((version: GeneratorVersionDocument) => {
          return {
            versionId: version.versionId,
            defaultConfig: version.defaultConfig,
          }
        }
      ),
    };
  })
  return reply.status(200).send({generators: responseObj});
};

interface RegisterGeneratorRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId: string;
    defaultConfig: any;
  }
}

export const registerGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { generatorName, versionId, defaultConfig } = request.body as RegisterGeneratorRequest["body"];

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
    generatorName,
  });

  if (generator) {
    // Already exists, add new version
    await server.mongo.db.collection("generators").updateOne({
      generatorName,
    }, {
      $push: {
        versions: generatorVersion,
      },
    });
    return reply.status(200).send({
      generatorName,
      versionId,
    });
  }

  await server.mongo.db.collection("generators").insertOne({
    generatorName,
    versions: [generatorVersion],
  });

  return reply.status(200).send({
    generatorName,
    versionId,
  });
}

interface DeprecateGeneratorRequest extends FastifyRequest {
  body: {
    generatorName: string;
    versionId: string;
  }
}

export const deprecateGenerator = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { generatorName, versionId } = request.body as DeprecateGeneratorRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generator = await server.mongo.db.collection("generators").findOne({
    generatorName,
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
    generatorName,
  }, {
    $set: {
      [`versions.${versionIndex}.isDeprecated`]: true,
    },
  });

  return reply.status(200).send({
    generatorName,
    versionId,
  });
}