import { FastifyRequest, FastifyReply } from "fastify";
import { User, UserDocument } from "../../models/User";
import { ProfileUpdateRequestBody } from "../../routes/user/profileRoutes";


export const getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  let { userId } = request.params as {userId: string};
  
  if (!userId) {
    userId = request.user.userId.toString();
  }

  let user: UserDocument | null = null;

  try {
    user = await User.findOne({userId})
  } catch (error) {
    return reply.status(400).send({
      message: `User ${userId} not found`
    });
  }

  return reply.status(200).send({user});
};

export const updateProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const update = request.body as ProfileUpdateRequestBody
  const user = await User.findById(userId);
  
  if (!user) {
    return reply.status(400).send({
      message: `User ${userId} not found`
    });
  }

  user.username = update.username || user.username;
  user.name = update.name || user.name;
  user.bio = update.bio || user.bio;
  user.email = update.email || user.email;
  user.profilePictureUri = update.profilePictureUri || user.profilePictureUri;
  user.coverPictureUri = update.coverPictureUri || user.coverPictureUri;
  user.website = update.website || user.website;  
  user.discordId = update.discordId || user.discordId;
  user.twitterId = update.twitterId || user.twitterId;
  user.instagramId = update.instagramId || user.instagramId;
  user.githubId = update.githubId || user.githubId;

  await user.save();

  return reply.status(200).send({user});
}
