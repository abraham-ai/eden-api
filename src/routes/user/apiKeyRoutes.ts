import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../../middleware/authMiddleware";

import { 
  createApiKey, 
  deleteApiKey,
  listApiKeys, 
} from "../../controllers/apiKeyController";


const apiKeyRoutes: FastifyPluginAsync = async (server) => {
  
  server.post('/user/api/create', {
    schema: {
      request: {
        body: Type.Object({
          note: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => createApiKey(request, reply),
  });

  server.delete('/user/api/delete/:apiKey', {
    schema: {
      response: {
        200: Type.Object({
          apiKey: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => deleteApiKey(request, reply),
  });
  
  server.get('/user/api/keys', {
    schema: {
      response: {
        200: Type.Array(Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
          note: Type.String(),
          createdAt: Type.String(),
        })),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => listApiKeys(request, reply),
  });

}

export default apiKeyRoutes;