import { Creation, CreationDocument } from "../models/Creation";
import { FastifyRequest, FastifyReply } from "fastify";

interface GetCreationsRequest {
  query: {
    userId: string;
  }
}

export const getCreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as GetCreationsRequest["query"];

  let creations: CreationDocument[] = [];

  if (!userId) {
    creations = await Creation.find({});
  } else {
    creations = await Creation.find({
      user: userId,
    });
  }

  return reply.status(200).send({
    creations,
  });
};