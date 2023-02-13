import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../../middleware/authMiddleware";

import { 
  createApiKey,
  deleteApiKey,
  getApiKeys, 
} from "../../controllers/user/apiKeyController";


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
          apiKey: Type.Object({
            apiKey: Type.String(),
            apiSecret: Type.String(),
            note: Type.String(),
          })
        }),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => createApiKey(request, reply),
  });

  server.post('/user/api/delete', {
    schema: {
      request: {
        body: Type.Object({
          apiKey: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          success: Type.Boolean(),
        }),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => deleteApiKey(request, reply),
  });
  
  server.get('/user/api/keys', {
    schema: {
      response: {
        200: Type.Object({
          apiKeys: Type.Array(Type.Object({
            apiKey: Type.String(),
            apiSecret: Type.String(),
            note: Type.String(),
            createdAt: Type.String(),
          }))
        }),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => getApiKeys(request, reply),
  });

}

export default apiKeyRoutes;