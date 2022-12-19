import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from 'uuid';

interface DeleteApiKeyRequest extends FastifyRequest {
  body: {
    apiKey: string;
  }
}

export const createApiKey = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const apiKey = uuidv4();
  const apiSecret = uuidv4();

  await server.mongo.db.collection("apiKeys").insertOne({
    apiKey,
    apiSecret,
    userId,
  });

  return reply.status(200).send({
    apiKey,
    apiSecret,
  });
};

export const listApiKeys = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const apiKeys = await server.mongo.db.collection("apiKeys").find({
    userId,
  }).toArray();

  return reply.status(200).send(apiKeys);
}

export const deleteApiKey = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { body: { apiKey } } = request as DeleteApiKeyRequest;

  if (!apiKey) {
    return reply.status(400).send({
      message: "Missing apiKey",
    });
  }

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const dbApiKey = await server.mongo.db.collection("apiKeys").findOne({
    apiKey,
    userId,
  });

  if (!dbApiKey) {
    return reply.status(401).send({
      message: "Invalid credentials",
    });
  }

  await server.mongo.db.collection("apiKeys").deleteOne({
    apiKey,
    userId,
  });

  return reply.status(200).send({
    apiKey,
  });
}