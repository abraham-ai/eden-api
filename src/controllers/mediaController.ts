import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { uploadBufferAsset, minioUrl } from "../plugins/minioPlugin";

export const uploadMedia = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  try {
    const data = await request.file();
    const buffer = await data?.toBuffer();
    const sha = await uploadBufferAsset(server, buffer, "jpg");
    const url = minioUrl(server, sha);
    return reply.status(200).send({
      url: url,
    });

  } catch (err) {
    console.log(err)
    return reply.status(500).send({
      message: "Failed to upload media",
    });
  }
}