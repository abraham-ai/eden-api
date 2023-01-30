import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";

import { 
  getCollections, 
  getCollection, 
  createCollection, 
  updateCollection 
} from "../controllers/collectionsController";


const collectionRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/collection/:collectionId', {
    schema: {
      response: {
        200: {
          collection: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCollection(request, reply),
  });

  server.get('/collections', {
    schema: {
      querystring: {
        userId: {
          type: "string",
        }
      },
      response: {
        200: {
          collections: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCollections(request, reply),
  });

  server.post('/collections/create', {
    schema: {
      request: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
      response: {
        200: {
          collection: Type.Any(),
        }
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => createCollection(request, reply),
  });

  server.post('/collections/update', {
    schema: {
      querystring: {
        name: {
          type: "string",
        }
      },
      request: {
        body: Type.Object({
          collectionId: Type.String(),
          creationId: Type.String(),
          action: Type.String(),
        }),
      },
      response: {
        200: {
          collection: Type.Any(),
        }
      }
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => updateCollection(request, reply),
  });
  
}

export default collectionRoutes;