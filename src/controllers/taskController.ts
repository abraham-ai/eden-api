import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export const requestCreation = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    message: "Creation requested",
  });
};

export const fetchTasks = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    message: "Creations fetched",
  });
}

export const create = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  return reply.status(200).send({
    message: "Creation created",
  });
}
