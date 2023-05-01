import { FastifyRequest, FastifyReply } from "fastify";
import { randomId } from "../../lib/util";
import { ApiKey } from "../../models/ApiKey";


export const createApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { note } = request.body as {note: string};

  const apiKey = randomId(24);
  const apiSecret = randomId(24);

  const data = {
    user: userId,
    apiKey: apiKey,
    apiSecret: apiSecret,
    note: note,
    deleted: false,
  }

  const apiKeyModel = new ApiKey(data);
  await apiKeyModel.save();

  return reply.status(200).send({
    apiKey: apiKeyModel
  });
};

export const deleteApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { apiKey } = request.body as {apiKey: string};

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
      message: "API key not found",
    });
  }

  await dbApiKey.delete();

  return reply.status(200).send({
    success: true,
  });
}

export const getApiKeys = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const apiKeys = await ApiKey.find({
    user: userId
  });

  return reply.status(200).send({apiKeys});
}
