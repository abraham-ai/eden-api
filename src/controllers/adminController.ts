import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { v4 as uuidv4 } from 'uuid';

interface adminCreateUserRequest extends FastifyRequest {
  body: {
    userId: string;
  }
}

export const adminCreateUser = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.body as adminCreateUserRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const user = await server.mongo.db.collection("users").findOne({
    userId,
  });

  if (user) {
    return reply.status(409).send({
      message: "User already exists",
    });
  }

  await server.mongo.db.collection("users").insertOne({
    userId,
    isWallet: false,
    isAdmin: false,
  });

  const apiKey = uuidv4();
  const apiSecret = uuidv4();

  await server.mongo.db.collection("apiKeys").insertOne({
    apiKey,
    apiSecret,
    userId,
  });

  return reply.status(200).send({
    userId,
    apiKey,
    apiSecret,
  });
};