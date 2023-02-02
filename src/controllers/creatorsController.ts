import { FastifyRequest, FastifyReply } from "fastify";

import { User, UserDocument } from "../models/User";
import { Creation, CreationDocument } from "../models/Creation";
import { Follow, FollowDocument } from "../models/Follow";

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
  
interface GetFollowingParams {
  userId: string;
}

export const getFollowing = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as GetFollowingParams;
  
  let following: UserDocument[] | null = [];

  try {
    following = await Follow.find({userFollower: userId});//.populate('users');
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'No following found'
    });
  }

  return reply.status(200).send({
    following,
  });
};

interface GetFollowersParams {
  userId: string;
}

export const getFollowers = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as GetFollowersParams;

  console.log("userId: " + userId)
  let followers: UserDocument[] | null = [];

  try {
    followers = await Follow.find({userFollowee: userId});//?.populate('users');
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'No followers found'
    });
  }

  return reply.status(200).send({
    followers,
  });
}

interface FollowRequest {
  body: {
    userId: string;
    action: string;
  }
}

export const follow = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { userId: userIdToFollow } = request.body as FollowRequest["body"];

  const userToFollow = await User.findById(userIdToFollow);

  if (!userToFollow) {
    return reply.status(400).send({
      message: 'User does not exist'
    });
  }

  if (userId.toString() === userIdToFollow) {
    return reply.status(400).send({
      message: 'Cannot follow yourself'
    });
  }

  const followData = {
    userFollower: userId,
    userFollowee: userIdToFollow,
  };

  const followResult = await Follow.findOne(followData);
  
  if (followResult) {
    return reply.status(400).send({
      message: 'Already following user'
    });
  }

  try {
    const follow: FollowDocument | null = await Follow.create(followData);
    return reply.status(200).send({
      success: true
    });
  } 
  catch (error) {
    return reply.status(400).send({
      message: 'Could not follow user'
    });
  }
}

export const unfollow = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { userId: userIdToUnfollow } = request.body as FollowRequest["body"];

  const userToUnfollow = await User.findById(userIdToUnfollow);
  
  if (!userToUnfollow) {
    return reply.status(400).send({
      message: 'User does not exist'
    });
  }

  if (userId.toString() === userIdToUnfollow) {
    return reply.status(400).send({
      message: 'Cannot follow yourself'
    });
  }

  const followData = {
    userFollower: userId,
    userFollowee: userIdToUnfollow,
  };

  let follow: FollowDocument | null = await Follow.findOne(followData);
  
  if (!follow) {
    return reply.status(400).send({
      message: 'Not following user'
    });
  }
  
  try {
    await follow.remove();
    return reply.status(201).send({
      follow,
    });
  }
  catch (error) {
    return reply.status(400).send({
      message: 'Could not unfollow user'
    });
  }
}
