import { FastifyInstance, FastifyReply } from "fastify";

export const uploadMedia = async (server: FastifyInstance, reply: FastifyReply) => {
  console.log("Media uploading!!");
  return reply.status(200).send({
    message: "Media uploaded",
  });
}