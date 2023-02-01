import { ApiKey } from "../models/ApiKey";
import { FastifyRequest, FastifyReply } from "fastify";
import crypto from 'crypto';


const randomId = (length: number) => {
  const rand = crypto.randomBytes(length);
  const uniqueId = rand.toString("hex")
  return uniqueId; 
}


// interface CreateApiKeyRequest {
//   body: {
//     note: string;
//   }
// }

export const createApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const { note } = request.body as {note: string}; //CreateApiKeyRequest["body"];

  const apiKey = randomId(20);
  const apiSecret = randomId(20);

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
    apiKey,
    apiSecret,
  });
};


// interface DeleteApiKeyParams {
//   apiKey: string;
// }

export const deleteApiKey = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { apiKey } = request.params as {apiKey: string}; //DeleteApiKeyParams;

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
    apiKey,
  });
}


export const listApiKeys = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const apiKeys = await ApiKey.find({
    user: userId
  });

  return reply.status(200).send(apiKeys);
}
