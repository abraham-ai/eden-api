import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "../../middleware/authMiddleware";

import { updateProfile, getUser } from "../../controllers/user/userController";


const userRoutes: FastifyPluginAsync = async (server) => {

  server.get('/user/profile', {
    schema: {
      response: {
        200: Type.Object({
          user: Type.Any(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => getUser(request, reply),
  });

  server.post('/user/profile/update', {
    schema: {
      request: {
        body: Type.Object({
          username: Type.String(),
          name: Type.String(),
          bio: Type.String(),
          email: Type.String(),
          profilePictureUri: Type.String(),
          coverPictureUri: Type.String(),
          website: Type.String(),
          discordId: Type.String(),
          twitterId: Type.String(),
          instagramId: Type.String(),
          githubId: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          user: Type.Any(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => updateProfile(server, request, reply),
  });

  server.get('/user/profile/:userId', {
    schema: {
      response: {
        200: Type.Object({
          user: Type.Any(),
        }),
      }
    },
    handler: (request, reply) => getUser(request, reply),
  });

}

export default userRoutes;