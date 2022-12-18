import { isAdmin } from '@/middleware/auth';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routeRoot = '/credits'

const creditsRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${routeRoot}/add`, {
    schema: {
      request: {
        body: Type.Object({
          userId: Type.String(),
          amount: Type.Number(),
        }),
      },
      response: {
        200: Type.Object({
          userId: Type.String(),
          balance: Type.Number(),
        }),
      },
    },
    preHandler: [(request) => isAdmin(request)],
    handler: async (request) => {
      return {
        userId: request.body.userId,
        balance: 100,
      }
    },
  })
}

export default creditsRoutes;
