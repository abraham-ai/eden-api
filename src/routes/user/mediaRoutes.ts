import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { uploadMedia } from "../../controllers/mediaController";
import { isAuth } from "../../middleware/authMiddleware";

const baseRoute = '/media/upload';

const mediaRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}`, {
    schema: {
      request: {
        body: Type.Object({
          media: Type.String(),
        }),
      },
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