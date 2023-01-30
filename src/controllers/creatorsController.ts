import { FastifyRequest, FastifyReply } from "fastify";

import { User, UserDocument } from "../models/User";
import { Creation, CreationDocument } from "../models/Creation";

interface CreatorDocument extends UserDocument {
  creations: CreationDocument[];
}

interface GetCreatorParams {
  username: string;
}

export const getCreator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { username } = request.params as GetCreatorParams;
  
  let creator: CreatorDocument | null = null;

  try {
    creator = await User.findOne({username: username}) as CreatorDocument;
  } catch (error) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }

  if (!creator) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }

  const creations = await Creation.find({user: creator._id}).populate({
    path: 'task',
    select: 'config status'
  });
  creator.creations = creations;

  return reply.status(200).send({
    creator,
  });
};

interface GetCreatorsRequest {
  body: {
    userIds: string[];
  }
}

export const getCreators = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userIds = [] } = request.body as GetCreatorsRequest["body"] || {};

  let creators: CreatorDocument[] = [];

  let filter = {};
  if (userIds.length > 0) {
    filter = {_id: {$in: userIds}};
  }

  creators = await User.find(filter) as CreatorDocument[];
  for (const creator of creators) {
    const creations = await Creation.find({user: creator._id}).populate({
      path: 'task',
      select: 'config status'
    });
    creator.creations = creations;
  }
  return reply.status(200).send({
    creators,
  });
};
  