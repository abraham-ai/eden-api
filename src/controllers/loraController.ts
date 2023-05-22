import { Lora } from "../models/Lora";
import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User";
import { GetLoraParams, GetLorasQuery } from "../routes/loraRoutes";

export const getLora = async (request: FastifyRequest, reply: FastifyReply) => {
  const { loraId } = request.params as GetLoraParams;

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
  const { userId } = request.query as GetLorasQuery;
  const user = await User.findOne({userId});
  if (!user) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }
  const characters = await Lora.find({user: user._id});
  return reply.status(200).send(characters);
};
