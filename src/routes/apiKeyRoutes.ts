import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { isAuth } from "../middleware/authMiddleware";
import { createApiKey, listApiKeys, deleteApiKey } from "../controllers/apiKeyController";

const baseRoute = '/api-key';

const apiKeyRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${baseRoute}`, {
    schema: {
      response: {
        200: Type.Array(Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        })),
      },
    },
    preHandler: [async (request) => isAuth(server, request)],
    handler: (request, reply) => listApiKeys(request, reply),
  });
  server.post(`${baseRoute}/create`, {
    schema: {
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
  server.delete(`${baseRoute}/:apiKey`, {
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
}

export default apiKeyRoutes;