import ethers from "ethers";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

interface ApiKeyLoginRequest extends FastifyRequest {
  body: {
    apiKey: string;
    apiSecret: string;
  }
}

interface WalletLoginRequest extends FastifyRequest {
  body: {
    address: string;
    message: string;
    signature: string;
  }
}

export const loginApiKey = async (
  server: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { body: { apiKey, apiSecret} } = request as ApiKeyLoginRequest;

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const dbApiKey = await server.mongo.db.collection("apiKeys").findOne({
    apiKey,
    apiSecret,
  });

  if (!dbApiKey) {
    return reply.status(401).send({
      message: "Invalid credentials",
    });
  }

  const userId = dbApiKey.userId as string;

  const user = await server.mongo.db.collection("users").findOne({
    userId: userId,
  });

  if (!dbApiKey || !user) {
    return reply.status(401).send({
      message: "Invalid credentials",
    });
  }

  const isAdmin = user.isAdmin as boolean;

  const token = await reply.jwtSign({
    userId,
    isAdmin,
  });
  return reply.status(200).send({
    token,
  });
};

export const loginWallet = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { body: { address, signature, message } } = request as WalletLoginRequest;

    if (!address || !signature || !message) {
      return reply.status(400).send({
        message: "Missing address, signature or message",
      });
    }

    if (!server.mongo.db) {
      return reply.status(500).send({
        message: "Database not connected",
      });
    }

    const recovered = ethers.utils.verifyMessage(message, signature);

    if (address.toLowerCase() !== recovered.toLowerCase()) {
      return reply.status(400).send({
        message: "Signature is invalid",
      });
    }

    const user = await server.mongo.db.collection("users").findOne({
      userId: address,
      isWallet: true,
    });

    if (!user) {
      // Create new user
      await server.mongo.db.collection("users").insertOne({
        userId: address,
        isWallet: true,
        isAdmin: false,
      });
    }

    const token = await reply.jwtSign({
      userId: address,
      isAdmin: false,
    });

    return reply.status(200).send({
      token,
    });
};

