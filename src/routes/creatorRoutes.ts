import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";

import { 
  followCreator,
  getCreator, 
  getFollowers,
  getFollowing,
  listCreators,
  unfollowCreator,
  updateProfile,
} from "../controllers/creatorController";

export interface CreatorGetQuery {
  userId: string;
}

export interface CreatorFollowersListQuery {
  userId: string;
}

export interface CreatorFollowingListQuery {
  userId: string;
}

export interface CreatorProfileUpdateBody {
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

export interface CreatorFollowBody {
  userId: string;
}

export interface CreatorUnfollowBody {
  userId: string;
}

const creatorRoutes: FastifyPluginAsync = async (server) => {
  server.get('/creators/get', {
    schema: {
      querystring: {
        userId: Type.String(),
      },
      response: {
        200: {
          creator: Type.Any(),
        }
      }
    },
    handler: (request, reply) => getCreator(request, reply),
  });

  server.get('/creators/list', {
    schema: {
      response: {
        200: {
          creators: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => listCreators(request, reply),
  });

  server.get('/creators/followers', {
    schema: {
      querystring: {
        userId: Type.String(),
      },
      response: {
        200: {
          followers: Type.Array(Type.Any()),
        }
      }
    },
    handler: (request, reply) => getFollowers(request, reply),
  });

  server.get('/creators/following', {
    schema: {
      querystring: {
        userId: Type.String(),
      },
      response: {
        200: {
          following: Type.Array(Type.Any()),
        }
      }
    },
    handler: (request, reply) => getFollowing(request, reply),
  });

  server.post('/creators/profile', {
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
        200: {
          creator: Type.Any(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => updateProfile(request, reply),
  });

  server.post('/creators/follow', {
    schema: {
      body: Type.Object({
        userId: Type.String(),
      }),
      response: {
        200: {
          following: Type.String(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => followCreator(request, reply),
  });

  server.post('/creators/unfollow', {
    schema: {
      body: Type.Object({
        userId: Type.String(),
      }),
      response: {
        200: {
          unfollowed: Type.String(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => unfollowCreator(request, reply),
  });
}

export default creatorRoutes;