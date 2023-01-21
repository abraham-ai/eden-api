import { FastifyRequest, FastifyReply } from "fastify";
import fs from 'fs'

export const uploadMedia = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await request.file()
  const buffer = await data?.toBuffer()
  
  let filename = "test.jpg";
  fs.createWriteStream(filename).write(buffer);
  
  return reply.status(200).send({
    url: "Media uploaded",
  });
}