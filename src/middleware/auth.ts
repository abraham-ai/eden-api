import { FastifyRequest } from "fastify";

export const isAuth = async (request: FastifyRequest) => {
  if (!request.user) {
    throw new Error("Not authorized");
  }
}

export const isAdmin = async (request: FastifyRequest) => {
  if (!request.user.isAdmin) {
    throw new Error("Not authorized");
  }
}