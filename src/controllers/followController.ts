import { FastifyRequest, FastifyReply } from "fastify";

import { User, UserDocument } from "../models/User";
import { Follow, FollowDocument } from "../models/Follow";


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

  let followers: UserDocument[] | null = [];

  try {
    followers = await Follow.find({userFollowee: userId}).populate('users');
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

export const followUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { userId: userIdToFollow, action } = request.body as FollowRequest["body"];

  // check if user exists
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

  let follow: FollowDocument | null = null;

  if (action === 'unfollow') {
    try {
      follow = await Follow.findOne(followData);
      if (!follow) {
        return reply.status(400).send({
          message: 'Not following user'
        });
      }
      await follow.remove();
    }
    catch (error) {
      return reply.status(400).send({
        message: 'Could not unfollow user'
      });
    }    
  }
  else if (action === 'follow') {
    const followResult = await Follow.findOne(followData);
    if (followResult) {
      return reply.status(400).send({
        message: 'Already following user'
      });
    }

    try {
      follow = await Follow.create(followData);
    } 
    catch (error) {
      return reply.status(400).send({
        message: 'Could not follow user'
      });
    }
  }
  else {
    return reply.status(400).send({
      message: 'Invalid action. Only "follow" or "unfollow" are allowed'
    });
  }

  return reply.status(201).send({
    follow,
  });

}