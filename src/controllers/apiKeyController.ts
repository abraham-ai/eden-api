import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from 'uuid';

export const createApiKey = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  console.log("uidddd", userId);

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
    user: userId
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
    user: userId
  }).toArray();

  return reply.status(200).send(apiKeys);
}

interface DeleteApiKeyParams {
  apiKey: string;
}

export const deleteApiKey = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { apiKey } = request.params as DeleteApiKeyParams;

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
    user: userId
  });

  if (!dbApiKey) {
    return reply.status(401).send({
      message: "Invalid credentials",
    });
  }

  await server.mongo.db.collection("apiKeys").deleteOne({
    apiKey,
    user: userId
  });

  return reply.status(200).send({
    apiKey,
  });
}