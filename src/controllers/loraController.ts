import { Lora, LoraDocument } from "../models/Lora";
import { FastifyRequest, FastifyReply } from "fastify";


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

  return reply.status(200).send({
    lora,
  });
};

interface GetLorasRequest {
  query: {
    userId: string;
  }
}

export const getLoras = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as GetLorasRequest["query"];

  let loras: LoraDocument[] = [];

  let filter = {};
  if (userId) {
    filter = {user: userId};
  }

  loras = await Lora.find(filter);
  
  return reply.status(200).send({
    loras,
  });
};
