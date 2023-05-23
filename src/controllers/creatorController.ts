import { FastifyRequest, FastifyReply } from "fastify";

import { User } from "../models/Creator";
import { Follow, FollowDocument } from "../models/Follow";
import { CreatorFollowBody, CreatorFollowersListQuery, CreatorFollowingListQuery, CreatorGetQuery, CreatorProfileUpdateBody, CreatorUnfollowBody } from "../routes/creatorRoutes";

export const getCreator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as CreatorGetQuery;
  
  const creator = await User.findOne({userId: userId});
  if (!creator) {
    return reply.status(404).send({
      message: `User not found`
    });
  }

  return reply.status(200).send({creator});
};

export const listCreators = async (request: FastifyRequest, reply: FastifyReply) => {
const creators = await User.find({})

  return reply.status(200).send({creators});
};

export const getFollowers = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as CreatorFollowersListQuery
  const user = await User.findOne({userId: userId});
  if (!user) {
    return reply.status(404).send({
      message: `User not found`
    });
  }
  const followers = await Follow.find({userFollowee: user._id});

  return reply.status(200).send({followers});
}

export const getFollowing = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as CreatorFollowingListQuery
  const user = await User.findOne({userId: userId});
  if (!user) {
    return reply.status(404).send({
      message: `User not found`
    });
  }
  
  const following = await Follow.find({userFollower: user._id});

  return reply.status(200).send({following});
}


export const followCreator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { userId: userIdToFollow } = request.body as CreatorFollowBody

  const userToFollow = await User.findOne({userId: userIdToFollow})

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
    userFollowee: userToFollow._id
  };

  const followResult = await Follow.findOne(followData);
  
  if (followResult) {
    return reply.status(400).send({
      message: 'Already following user'
    });
  }

  try {
    await Follow.create(followData);
    return reply.status(200).send({
      following: userIdToFollow
    });
  } 
  catch (error) {
    return reply.status(400).send({
      message: 'Could not follow user'
    });
  }
}

export const unfollowCreator = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { userId: userIdToUnfollow } = request.body as CreatorUnfollowBody

  const userToUnfollow = await User.findOne({userId: userIdToUnfollow})
  
  if (!userToUnfollow) {
    return reply.status(400).send({
      message: 'User does not exist'
    });
  }

  if (userId.toString() === userIdToUnfollow) {
    return reply.status(400).send({
      message: 'Cannot unfollow yourself'
    });
  }

  const followData = {
    userFollower: userId,
    userFollowee: userToUnfollow._id
  };

  const follow: FollowDocument | null = await Follow.findOne(followData);
  
  if (!follow) {
    return reply.status(400).send({
      message: 'Not following user'
    });
  }
  
  try {
    await follow.remove();
    return reply.status(200).send({
      unfollowed: userIdToUnfollow
    });
  }
  catch (error) {
    return reply.status(400).send({
      message: 'Could not unfollow user'
    });
  }
}

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const update = request.body as CreatorProfileUpdateBody
  const user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: `User ${userId} not found`
    });
  }

  await user.updateOne(update);

  return reply.status(200).send({creator: user});
}
