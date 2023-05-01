import { ApiKey } from "../models/ApiKey";
import { User } from "../models/User";
import { FastifyInstance, FastifyRequest } from "fastify";

const apiKeyVerify = async (request: FastifyRequest) => {
  
  if (!request.headers["x-api-secret"]) {
    throw new Error("Missing API secret");
  }

  const apiKey = await ApiKey.findOne({
    apiKey: request.headers["x-api-key"],
    apiSecret: request.headers["x-api-secret"],
  });

  if (!apiKey) {
    throw new Error("Invalid API key or secret");
  }

  const user = await User.findById(apiKey.user);

  if (!user) {
    throw new Error("User not found");
  }
  
  request.user = {
    userId: user._id,
    isAdmin: user.isAdmin || false,
  }
};

const userVerify = async (request: FastifyRequest) => {
  await request.jwtVerify();

  if (!request.user) {
    throw new Error("Not authorized");
  }

  const user = await User.findById(request.user.userId);

  if (!user) {
    throw new Error("Not authorized");
  }

  request.user.isAdmin = user.isAdmin || false;
};

const getCredential = async (server: FastifyInstance, request: FastifyRequest) => {
  if (request.headers["x-api-key"]) {
    await apiKeyVerify(request);
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