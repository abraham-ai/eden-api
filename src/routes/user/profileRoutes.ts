import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "../../middleware/authMiddleware";

import { updateProfile, getProfile } from "../../controllers/user/profileController";

export const PROFILE_BASE_ROUTE = '/user/profile';

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
    handler: (request, reply) => getProfile(request, reply),
  });

  server.post(`${PROFILE_BASE_ROUTE}/:userId`, {
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

  server.get(`${PROFILE_BASE_ROUTE}/:userId`, {
    schema: {
      response: {
        200: Type.Object({
          user: Type.Any(),
        }),
      }
    },
    handler: (request, reply) => getProfile(request, reply),
  });

}

export default userRoutes;