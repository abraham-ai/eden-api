import { Lora } from "../models/Lora";
import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/Creator";
import { LoraGetQuery, LoraListQuery } from "../routes/loraRoutes";

export const getLora = async (request: FastifyRequest, reply: FastifyReply) => {
  const { loraId } = request.query as LoraGetQuery;

  try {
    const lora = await Lora.findById(loraId);
    return reply.status(200).send({
      lora,
    });
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Lora not found'
    });
  }
};

export const getLoras = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as LoraListQuery;
  const user = await User.findOne({userId});
  if (!user) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }
  const loras = await Lora.find({user: user._id});
  return reply.status(200).send({loras});
};
