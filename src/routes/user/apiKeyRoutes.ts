import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../../middleware/authMiddleware";

import { 
  createApiKey,
  deleteApiKey,
  getApiKeys, 
} from "../../controllers/user/apiKeyController";

export interface ApiKeyCreateRequestBody {
  note?: string;
}

export interface ApiKeyDeleteRequestParams {
  apiKey: string;
}

export const API_KEY_BASE_ROUTE = '/user/api-keys';

const apiKeyRoutes: FastifyPluginAsync = async (server) => {
  server.post(API_KEY_BASE_ROUTE, {
    schema: {
      body: Type.Object({
        note: Type.Optional(Type.String()),
      }),
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

  server.delete(`${API_KEY_BASE_ROUTE}/:apiKey`, {
    schema: {
      response: {
        204: Type.Object({}),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => deleteApiKey(request, reply),
  });
  
  server.get(API_KEY_BASE_ROUTE, {
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
    handler: (request, reply) => getApiKeys(request, reply),
  });

}

export default apiKeyRoutes;