import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { loginApiKey, protectedRoute } from '@/controllers/authController';

const baseRoute = '/auth';

const authRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/login/api-key`, {
    schema: {
      request: {
        body: Type.Object({
          apiKey: Type.String(),
          apiSecret: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          token: Type.String(),
        }),
      },
    },
    handler: (request, reply) => loginApiKey(server, request, reply),
  });
  server.get(`${baseRoute}/protected`, {
    onRequest: [server.authenticate],
    handler: async (request, reply) => protectedRoute(request, reply),
  })
}

export default authRoutes;
