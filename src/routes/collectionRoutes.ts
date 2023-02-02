import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";

import { 
  getCollections, 
  getCollection, 
  getCollectionCreations,
  addToCollection, 
  removeFromCollection, 
  renameCollection, 
  deleteCollection,
  createCollection, 
} from "../controllers/collectionsController";


const collectionRoutes: FastifyPluginAsync = async (server) => {

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

  server.get('/collection/:collectionId/creations', {
    schema: {
      response: {
        200: {
          creations: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCollectionCreations(request, reply),
  });

  server.post('/collection/:collectionId/add', {
    schema: {
      request: {
        body: Type.Object({
          creationId: Type.String(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => addToCollection(request, reply),
  });

  server.post('/collection/:collectionId/remove', {
    schema: {
      request: {
        body: Type.Object({
          creationId: Type.String(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => removeFromCollection(request, reply),
  });

  server.post('/collection/:collectionId/rename', {
    schema: {
      request: {
        body: Type.Object({
          name: Type.String(),
        }),
      },
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => renameCollection(request, reply),
  });

  server.post('/collection/:collectionId/delete', {
    schema: {
      response: {
        200: {
          success: Type.Boolean(),
        }
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => deleteCollection(request, reply),
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
  
}

export default collectionRoutes;