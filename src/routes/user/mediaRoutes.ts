import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';
import { uploadMedia } from "../../controllers/user/mediaController";
import { isAuth } from "../../middleware/authMiddleware";


const mediaRoutes: FastifyPluginAsync = async (server) => {
  
  server.post('/media/upload', {
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