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

  let filter = {};
  if (userId) {
    filter = {user: userId};
  }

  creations = await Creation.find(filter).populate({ 
    path: 'task',
    select: 'config status'
  });

  return reply.status(200).send({
    creations,
  });
};

interface GetCreationParams {
  creationId: string;
}

export const getCreation = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;
  
  let creation: CreationDocument | null = null;

  try {
    creation = await Creation.findById(creationId).populate({ 
      path: 'task',
      select: 'config status'
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    creation,
  });
};
