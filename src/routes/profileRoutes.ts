import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";

import { isAuth } from "../middleware/authMiddleware";

import { updateProfile, getProfile } from "../controllers/profileController";

export const PROFILE_BASE_ROUTE = '/user/profile';

export interface ProfileUpdateRequestBody {
  username?: string;
  name?: string;
  bio?: string;
  email?: string;
  profilePictureUri?: string;
  coverPictureUri?: string;
  website?: string;
  discordId?: string;
  twitterId?: string;
  instagramId?: string;
  githubId?: string;
}

const userRoutes: FastifyPluginAsync = async (server) => {
  server.get(PROFILE_BASE_ROUTE, {
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

  server.put(PROFILE_BASE_ROUTE, {
    schema: {
      body: Type.Object({
        username: Type.Optional(Type.String()),
        name: Type.Optional(Type.String()),
        bio: Type.Optional(Type.String()),
        email: Type.Optional(Type.String()),
        profilePictureUri: Type.Optional(Type.String()),
        coverPictureUri: Type.Optional(Type.String()),
        website: Type.Optional(Type.String()),
        discordId: Type.Optional(Type.String()),
        twitterId: Type.Optional(Type.String()),
        instagramId: Type.Optional(Type.String()),
        githubId: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          user: Type.Any(),
        }),
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => updateProfile(request, reply),
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