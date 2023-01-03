import { GeneratorVersionDocument } from "../models/Generator";
import { FastifyInstance, FastifyReply } from "fastify";

export const listGenerators = async (server: FastifyInstance, reply: FastifyReply) => {
  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const generators = await server.mongo.db.collection("generators").find({}).toArray();
  const responseObj = generators.map((generator) => {
    return {
      generatorId: generator.generatorId,
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