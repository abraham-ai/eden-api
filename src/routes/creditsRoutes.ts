import { isAdmin } from '@/middleware/authMiddleware';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { addCredits } from '@/controllers/creditsController';

const routeRoot = '/credits'

const creditsRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${routeRoot}/add`, {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
          type: Type.String(),
          amount: Type.Number(),
        }),
      },
      response: {
        200: Type.Object({
          userId: Type.String(),
          type: Type.String(),
          amount: Type.Number(),
        }),
      },
    },
    preHandler: [(request) => isAdmin(request)],
    handler: (request, reply) => addCredits(server, request, reply),
  })
}

export default creditsRoutes;
