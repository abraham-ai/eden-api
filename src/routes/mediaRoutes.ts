import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';

import { uploadMedia } from "@/controllers/mediaController";
import { isAdmin } from "@/middleware/authMiddleware";

const baseRoute = '/media';

const mediaRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/upload`, {
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
    preHandler: [async (request) => isAdmin(request)],
    handler: (_, reply) => uploadMedia(server, reply),
  });
}

export default mediaRoutes;