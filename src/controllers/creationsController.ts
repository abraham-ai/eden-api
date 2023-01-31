import { Creation, CreationDocument } from "../models/Creation";
import { FastifyRequest, FastifyReply } from "fastify";


interface GetCreationsRequest {
  body: {
    creatorId: string;
    collectionId: string;
    earliestTime: any;
    latestTime: any;
    limit: number;
  }
}

export const getCreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creatorId, earliestTime, latestTime, limit } = request.body as GetCreationsRequest["body"];

  let filter = {};
  Object.assign(filter, creatorId ? { user: creatorId } : {});
  if (earliestTime || latestTime) {
    Object.assign(filter, {
      createdAt: {
        ...(earliestTime ? { $gte: earliestTime } : {}),
        ...(latestTime ? { $lte: latestTime } : {}),
      },
    });
  }

  let creations: CreationDocument[] = [];

  creations = await Creation.find(filter)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: 'task',
      select: 'config status generator',
      populate: {
        path: 'generator',
        select: 'generatorName'
      }
    }
  );

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
