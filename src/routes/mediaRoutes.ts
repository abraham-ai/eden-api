import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { uploadMedia } from "@/controllers/mediaController";
import { isAuth } from "@/middleware/authMiddleware";

const mediaRoutes: FastifyPluginAsync = async (server) => {
  server.post('/media/upload', {
    schema: {
      response: {
        200: Type.Object({
          url: Type.String(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (req, reply) => uploadMedia(server, req, reply),
  });

}

export default mediaRoutes;