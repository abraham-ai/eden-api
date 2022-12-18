import { FastifyRequest, FastifyReply } from "fastify";

export const loginApiKey = async (
  server: any,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { apiKey, apiSecret } = request.body;

  const dbApiKey = await server.mongo.db.collection("apiKeys").findOne({
    apiKey,
    apiSecret,
  });

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

export const protectedRoute = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log("****", request.user)
  reply.send({userId: request.user.userId, isAdmin: request.user.isAdmin})
}