import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../../middleware/authMiddleware";

import { followUser } from "../../controllers/followController";


const userFollowRoutes: FastifyPluginAsync = async (server) => {
  
  server.post('/user/follow', {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
          action: Type.String(),
        }),
      },
      response: {
        200: {
          result: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => followUser(request, reply),
  });
  
}

export default userFollowRoutes;