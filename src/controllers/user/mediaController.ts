import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";
import { uploadBufferAsset } from "../../plugins/minioPlugin";


export const uploadMedia = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  try {
    const headers = request.headers;
    if (!headers.filetype) {
      return reply.status(500).send({
        message: "filetype must be specified in headers",
      });
    }
    const filetype = headers.filetype as string;
    const data = await request.file();
    const buffer = await data?.toBuffer();
    if (buffer) {
      const url = await uploadBufferAsset(server, buffer, filetype);
      return reply.status(200).send({
        url: url,
      });
    }
    else {
      return reply.status(500).send({
        message: "No data found in upload",
      });
    }
  } catch (err) {
    console.log(err)
    return reply.status(500).send({
      message: "Failed to upload media",
    });
  }
}