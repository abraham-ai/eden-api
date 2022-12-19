import { isAuth } from "@/middleware/auth";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { createApiKey, listApiKeys, deleteApiKey } from "@/controllers/apiKeyController";

const baseRoute = '/api-key';

const apiKeyRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/create`, {
    schema: {
      response: {
        200: Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => createApiKey(server, request, reply),
  });
  server.get(`${baseRoute}/list`, {
    schema: {
      response: {
        200: Type.Array(Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        })),
      },
    },
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => listApiKeys(server, request, reply),
  });
  server.delete(`${baseRoute}/delete`, {
    schema: {
      response: {
        200: Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAuth(request)],
    handler: (request, reply) => deleteApiKey(server, request, reply),
  });
}

export default apiKeyRoutes;