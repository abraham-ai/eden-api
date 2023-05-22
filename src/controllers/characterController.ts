import { Character } from "../models/Character";
import { FastifyRequest, FastifyReply } from "fastify";
import { GetCharacterQuery, GetCharactersQuery } from "../routes/characterRoutes";
import { User } from "../models/User";

export const getCharacter = async (request: FastifyRequest, reply: FastifyReply) => {
  const { characterId } = request.query as GetCharacterQuery

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
  const { userId } = request.query as GetCharactersQuery;
  const user = await User.findOne({userId});
  if (!user) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }
  const characters = await Character.find({user: user._id});
  return reply.status(200).send({characters});
};
