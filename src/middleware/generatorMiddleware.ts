import { getCost } from "@/lib/generator";
import { GeneratorConfig, GeneratorType } from "@/types/generatorTypes";
import { FastifyInstance, FastifyRequest } from "fastify";

interface CreateRequest {
  body: {
    userId: string;
    generator: GeneratorType;
    config: GeneratorConfig;
  }
}

export const userHasAdequateCredits = async (server: FastifyInstance, request: FastifyRequest) => {
  const { userId, generator, config } = request.body as CreateRequest["body"];

  if (!server.mongo.db) {
    throw new Error("Database not connected");
  }

  const credits = await server.mongo.db.collection("credits").findOne({
    userId,
  });

  if (!credits) {
    throw new Error("User has no credits");
  }
  
  const cost = getCost(generator, config);
  if (credits.credits.basic < cost) {
    throw new Error("User has insufficient credits");
  }
}