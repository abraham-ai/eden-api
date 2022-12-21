import { isAdmin } from "@/middleware/authMiddleware";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { adminCreateUser, registerGenerator, deprecateGenerator } from "@/controllers/adminController";

const baseRoute = '/admin';

const adminRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/create-user`, {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          userId: Type.String(),
          apiKey: Type.String(),
          apiSecret: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(request)],
    handler: (request, reply) => adminCreateUser(server, request, reply),
  });
  server.post(`${baseRoute}/generators/register`, {
    schema: {
      request: {
        body: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
          defaultConfig: Type.Any(),
          }),
      },
      response: {
        200: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(request)],
    handler: (request, reply) => registerGenerator(server, request, reply),
  });
  server.post(`${baseRoute}/generators/deprecate`, {
    schema: {
      request: {
        body: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
          }),
      },
      response: {
        200: Type.Object({
          generatorId: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(request)],
    handler: (request, reply) => deprecateGenerator(server, request, reply),
  });
}

export default adminRoutes;