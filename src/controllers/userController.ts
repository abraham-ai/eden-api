import { User } from "../models/User";
import { FastifyRequest, FastifyReply } from "fastify";

interface UpdateUserRequest extends FastifyRequest {
  body: {
    userId: string;
    name?: string;
    username?: string
    bio?: string;
    email?: string;
    profilePictureUri?: string;
    coverPictureUri?: string;
    discordId?: string;
    twitterId?: string;
    instagramId?: string;
  }
}

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.body as UpdateUserRequest["body"]

  const user = await User.findOne({
    userId,
  })

  if (!user) {
    return reply.status(400).send({
      message: "Invalid userId",
    });
  }

  let newUser;

  if(!user) {
    newUser = new User({

    })
  } else {

  }

  return reply.status(200).send({

  });
};

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;

  const user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: "Invalid userId",
    });
  }


  return reply.status(200).send({

  });
}