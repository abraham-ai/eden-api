import { ApiKey } from "../models/ApiKey";
import { FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from 'uuid';

export const createApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const apiKey = uuidv4();
  const apiSecret = uuidv4();

  const data = {
    apiKey,
    apiSecret,
    user: userId
  }

  const apiKeyModel = new ApiKey(data);
  await apiKeyModel.save();

  return reply.status(200).send({
    apiKey,
    apiSecret,
  });
};

export const listApiKeys = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const apiKeys = await ApiKey.find({
    user: userId
  });

  return reply.status(200).send(apiKeys);
}

interface DeleteApiKeyParams {
  apiKey: string;
}

export const deleteApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { apiKey } = request.params as DeleteApiKeyParams;

  if (!apiKey) {
    return reply.status(400).send({
      message: "Missing apiKey",
    });
  }
  
  const dbApiKey = await ApiKey.findOne({
    apiKey,
    user: userId
  });

  if (!dbApiKey) {
    return reply.status(401).send({
      message: "Invalid credentials",
    });
  }

  await dbApiKey.delete();

  return reply.status(200).send({
    apiKey,
  });
}