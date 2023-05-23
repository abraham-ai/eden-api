import { FastifyRequest, FastifyReply } from "fastify";
import { randomId } from "@/lib/util";
import { ApiKey, ApiKeyInput } from "@/models/ApiKey";
import { ApiKeyCreateBody, ApiKeyDeleteBody } from "@/routes/apiKeyRoutes";


export const createApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { note } = request.body as ApiKeyCreateBody;

  const apiKey = randomId(24);
  const apiSecret = randomId(24);

  const input: ApiKeyInput = {
    user: userId,
    apiKey: apiKey,
    apiSecret: apiSecret,
    note: note,
  }

  const apiKeyModel = new ApiKey(input);
  await apiKeyModel.save();

  return reply.status(200).send({
    apiKey: {
      apiKey: apiKey,
      apiSecret: apiSecret,
    }
  });
};

export const deleteApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { apiKey } = request.body as ApiKeyDeleteBody;

  if (!apiKey) {
    return reply.status(400).send({
      message: "Missing API Key",
    });
  }
  
  const dbApiKey = await ApiKey.findOne({
    apiKey,
    user: userId
  });

  if (!dbApiKey) {
    return reply.status(401).send({
      message: "API key not found",
    });
  }

  await dbApiKey.delete();

  return reply.status(200).send({});
}

export const getApiKeys = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const apiKeys = await ApiKey.find({
    user: userId,
    deleted: false,
  });

  return reply.status(200).send(apiKeys);
}