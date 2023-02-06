import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";

import { 
  getCreator, 
  getCreators,
  getFollowing, 
  getFollowers, 
  follow, 
  unfollow,
} from "../controllers/creatorsController";


const creatorRoutes: FastifyPluginAsync = async (server) => {

  server.post('/creators', {
    schema: {
      request: {
        userIds: Type.Array(Type.String()),
      },
      response: {
        200: {
          creators: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCreators(request, reply),
  });

  server.get('/creator/:username', {
    schema: {
      response: {
        200: {
          creator: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCreator(request, reply),
  });

  server.get('/creator/:username/following', {
    schema: {
      response: {
        200: {
          following: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getFollowing(request, reply),
  });

  server.get('/creator/:userId/followers', {
    schema: {
      response: {
        200: {
          followers: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getFollowers(request, reply),
  });

  server.post('/creator/:username/follow', {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => follow(request, reply),
  });

  server.post('/creator/:username/unfollow', {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => unfollow(request, reply),
  });
}

export default creatorRoutes;