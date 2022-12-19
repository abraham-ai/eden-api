import { isAdmin } from "@/middleware/authMiddleware";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import { adminCreateUser } from "@/controllers/adminController";

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
}

export default adminRoutes;