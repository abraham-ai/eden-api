import { GeneratorVersion } from "@/models/Generator";
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
      service: generator.service,
      name: generator.name,
      versions: generator.versions.map((version: GeneratorVersion) => {
        return {
          versionId: version.versionId,
          isDeprecated: version.isDeprecated,
        }
      }),
    };
  })
  return reply.status(200).send({generators: responseObj});
};