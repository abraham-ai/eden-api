import { FastifyInstance, FastifyRequest } from "fastify";

const apiKeyVerify = async (server: FastifyInstance, request: FastifyRequest) => {
  if (!server.mongo.db) {
    throw new Error("Database not connected");
  }

  if (!request.headers["x-api-secret"]) {
    throw new Error("Missing API secret");
  }

  const apiKey = await server.mongo.db.collection("apiKeys").findOne({
    apiKey: request.headers["x-api-key"],
    apiSecret: request.headers["x-api-secret"],
  });

  if (!apiKey) {
    throw new Error("Invalid API key or secret");
  }

  const user = await server.mongo.db.collection("users").findOne({
    _id: apiKey.user,
  });

  if (!user) {
    throw new Error("User not found");
  }
  
  request.user = {
    userId: user._id,
    isAdmin: user.isAdmin,
  }
};

const userVerify = async (request: FastifyRequest) => {
  await request.jwtVerify();
  if (!request.user) {
    throw new Error("Not authorized");
  }
};

const getCredential = async (server: FastifyInstance, request: FastifyRequest) => {
  if (request.headers["x-api-key"]) {
    await apiKeyVerify(server, request);
  } else {
    await userVerify(request);
  }
};

export const isAuth = async (server: FastifyInstance, request: FastifyRequest) => {
  await getCredential(server, request);
}

export const isAdmin = async (server: FastifyInstance, request: FastifyRequest) => {
  await getCredential(server, request);
  if (!request.user.isAdmin) {
    throw new Error("Not authorized");
  }
}