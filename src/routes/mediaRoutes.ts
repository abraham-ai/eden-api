import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { uploadMedia } from "../controllers/user/mediaController";
import { isAuth } from "../middleware/authMiddleware";

export const MEDIA_BASE_ROUTE = '/media';

const mediaRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${MEDIA_BASE_ROUTE}/upload`, {
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