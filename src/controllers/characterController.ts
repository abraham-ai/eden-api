import { Character } from "../models/Character";
import { FastifyRequest, FastifyReply } from "fastify";
import { CharacterGetQuery, CharacterListQuery } from "../routes/characterRoutes";
import { User } from "../models/Creator";

export const getCharacter = async (request: FastifyRequest, reply: FastifyReply) => {
  const { characterId } = request.query as CharacterGetQuery

  try {
    const character = await Character.findById(characterId);
    return reply.status(200).send({
      character,
    });
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Character not found'
    });
  }
};

export const getCharacters = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as CharacterListQuery;
  const user = await User.findOne({userId});
  if (!user) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }
  const characters = await Character.find({user: user._id});
  return reply.status(200).send({characters});
};
