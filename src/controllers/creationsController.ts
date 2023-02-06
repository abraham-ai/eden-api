import { assert } from "console";

import { Creation, CreationDocument } from "../models/Creation";
import { User, UserDocument } from "../models/User";
import { CollectionEvent, CollectionEventDocument } from "../models/CollectionEvent";
import { Reaction, ReactionDocument } from "../models/Reaction";
import { FastifyRequest, FastifyReply } from "fastify";


interface GetCreationsRequest {
  body: {
    username: string;
    collectionId: string;
    earliestTime: any;
    latestTime: any;
    limit: number;
  }
}

export const getCreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, collectionId, earliestTime, latestTime, limit } = request.body as GetCreationsRequest["body"];

  let user: UserDocument | null = null;

  console.log("looking for user", username)

  try {
    user = await User.findOne({username: username});
  } catch (error) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }

  console.log("found user: ", user)
  console.log("TBD collection id", collectionId)

  let filter = {};
  Object.assign(filter, user ? { user: user._id } : {});
  // Object.assign(filter, collectionId ? { collectionId: collectionId } : {});
  if (earliestTime || latestTime) {
    Object.assign(filter, {
      createdAt: {
        ...(earliestTime ? { $gte: earliestTime } : {}),
        ...(latestTime ? { $lte: latestTime } : {}),
      },
    });
  }

  console.log("filter", filter);

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

  console.log("get collections of", creationId);
  
  let collections: CollectionEventDocument[] = [];
  console.log("lets go 1")
  try {

    console.log("lets go 2")
    collections = await CollectionEvent.find({
      creation: creationId,
    }).populate({ 
      path: 'collectionId',
      select: 'name user createdAt'
    });

    console.log("lets go 3")

    console.log("collections", collections);

  } catch (error) {
    console.log("lets go 4")
    console.log("error", error);
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

  const reactionData = {
    creation: creationId,
    user: userId,
    reaction: reaction,
  }

  // check if user has already reacted
  const existingReaction = await Reaction.findOne(reactionData);

  if (existingReaction) {
    return reply.status(200).send({
      success: true
    });
  }
  

  try {         
    const newReaction = new Reaction(reactionData);
    await newReaction.save();
    return reply.status(200).send({
      success: true,
    });  
  } catch (error) {
    return reply.status(404).send({
      message: 'Reaction not found'
    });
  }

};