import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";

import { 
  getCreations,
  getCreation, 
  getCollections,
  getRecreations,
  getReactions,
  react,
} from "../controllers/creationsController";

export interface CreationsGetQuery {
  username?: string;
  generators?: string[];
  collectionId?: string;
  earliestTime?: string;
  latestTime?: string;
  limit?: number;
}

export interface CreationGetParams {
  creationId: string;
}

const creationRoutes: FastifyPluginAsync = async (server) => {
  server.get('/creations', {
    schema: {
      querystring: Type.Object({
        username: Type.Optional(Type.String()),
        generators: Type.Optional(Type.Array(Type.String())),
        collectionId: Type.Optional(Type.String()),
        earliestTime: Type.Optional(Type.Any()),
        latestTime: Type.Optional(Type.Any()),
        limit: Type.Optional(Type.Number()),
        reactions: Type.Optional(Type.Array(Type.String()))
      }),
      response: {
        200: {
          creations: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCreations(request, reply),
  });

  server.get('/creations/:creationId', {
    schema: {
      params: {
        creationId: Type.String(),
      },
      response: {
        200: {
          creation: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCreation(request, reply),
  });

  server.get('/creation/:creationId/collections', {
    schema: {
      response: {
        200: {
          collections: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCollections(request, reply),
  });

  server.get('/creation/:creationId/recreations', {
    schema: {
      response: {
        200: {
          creations: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getRecreations(request, reply),
  });

  server.post('/creation/:creationId/reactions', {
    schema: {
      request: {
        body: Type.Object({
          reactions: Type.Array(Type.String()),
        }),
      },
      response: {
        200: {
          reactions: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getReactions(request, reply),
  });

  server.post('/creation/:creationId/react', {
    schema: {
      request: {
        body: Type.Object({
          reaction: Type.String(),
          unreact: Type.Boolean(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => react(request, reply),
  });

}

export default creationRoutes;