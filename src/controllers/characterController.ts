import { Character, CharacterDocument } from "../models/Character";
import { FastifyRequest, FastifyReply } from "fastify";
import { User, UserDocument } from "../models/User";


interface GetCharacterParams {
  characterId: string;
}

export const getCharacter = async (request: FastifyRequest, reply: FastifyReply) => {
  const { characterId } = request.params as GetCharacterParams;

  let character: CharacterDocument | null = null;

  try {
    character = await Character.findById(characterId);
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Character not found'
    });
  }

  return reply.status(200).send({
    character,
  });
};

interface GetCharactersRequest {
  query: {
    userId: string;
    username: string;
  }
}

export const getCharacters = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, username } = request.query as GetCharactersRequest["query"];

  let filter = {};

  let user: UserDocument | null = null;
  if (username && !userId) {
    try {
      user = await User.findOne({username: username});
      if (!user) {
        return reply.status(200).send({characters: []});
      }  
    } 
    catch (error) {
      return reply.status(404).send({
        message: 'User not found'
      });
    }
    Object.assign(filter, user ? { user: user._id } : {});
  } else if (userId && !username) {
    Object.assign(filter, { user: userId });
  } else if (userId && username) {
    return reply.status(500).send({
      message: 'Specify either userId or username, not both'
    });
  }

  let characters: CharacterDocument[] = [];
  characters = await Character.find(filter);

  return reply.status(200).send({characters});
};
