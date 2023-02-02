import { Creation, CreationDocument } from "../models/Creation";
import { CollectionEvent, CollectionEventDocument } from "../models/CollectionEvent";
import { Reaction, ReactionDocument } from "../models/Reaction";
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

export const getCollections = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;
  
  let collections: CollectionEventDocument[] = [];

  try {
    collections = await CollectionEvent.find({
      creation: creationId,
    }).populate({ 
      path: 'collectionId',
      select: 'name user createdAt'
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    collections,
  });
};

export const getRecreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;

  let creations: CreationDocument[] = [];

  try {
    creations = await Creation.find({
      parent: creationId,
    }).populate({
      path: 'task',
      select: 'config status generator',
      populate: {
        path: 'generator',
        select: 'generatorName'
      }
    });
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }
  
  return reply.status(200).send({
    creations,
  });
};

export const getReactions = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;

  let reactions: ReactionDocument[] = [];

  try {
    reactions = await Reaction.find({
      creation: creationId,
    }).populate({
      path: 'user',
      select: 'username'
    });
  }
  catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  return reply.status(200).send({
    reactions,
  });
};

export const react = async (request: FastifyRequest, reply: FastifyReply) => {
  const { creationId } = request.params as GetCreationParams;
  const { reaction } = request.body as { reaction: string };
  const userId = request.user.userId;

  let creation: CreationDocument | null = null;

  try {
    creation = await Creation.findById(creationId);
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  if (!creation) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

  const newReaction = new Reaction({
    creation: creationId,
    user: userId,
    reaction: reaction,
  });

  await newReaction.save();

  return reply.status(200).send({
    success: true
  });
};