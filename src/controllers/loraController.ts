import { Lora, LoraDocument } from "../models/Lora";
import { FastifyRequest, FastifyReply } from "fastify";
import { User, UserDocument } from "../models/User";


interface GetLoraParams {
  loraId: string;
}

export const getLora = async (request: FastifyRequest, reply: FastifyReply) => {
  const { loraId } = request.params as GetLoraParams;

  let lora: LoraDocument | null = null;
  try {
    lora = await Lora.findById(loraId);
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Lora not found'
    });
  }

  return reply.status(200).send({lora});
};

interface GetLorasRequest {
  query: {
    userId: string;
    username: string;
  }
}

export const getLoras = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, username } = request.query as GetLorasRequest["query"];

  let filter = {};

  let user: UserDocument | null = null;
  if (username && !userId) {
    try {
      user = await User.findOne({username: username});
      if (!user) {
        return reply.status(200).send({loras: []});
      }  
    } 
    catch (error) {
      return reply.status(401).send(error);
    }
    Object.assign(filter, user ? { user: user._id } : {});
  } else if (userId && !username) {
    Object.assign(filter, { user: userId });
  } else if (userId && username) {
    return reply.status(400).send({
      message: 'Specify either userId or username, not both'
    });
  }

  let loras: LoraDocument[] = [];
  loras = await Lora.find(filter);
  
  return reply.status(200).send({loras});
};
