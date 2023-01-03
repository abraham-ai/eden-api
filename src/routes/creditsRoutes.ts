import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { isAdmin, isAuth } from '../middleware/authMiddleware';
import { addCredits, getBalance } from '../controllers/creditsController';

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
          transactionId: Type.String(),
        }),
      },
    },
    preHandler: [(request) => isAdmin(request)],
    handler: (request, reply) => addCredits(server, request, reply),
  })
  server.get(`${routeRoot}/balance`, {
    schema: {
      response: {
        200: Type.Object({
          balance: Type.Number(),
        }),
      },
    },
    preHandler: [(request) => isAuth(request)],
    handler: (request, reply) => getBalance(server, request, reply),
  })
}

export default creditsRoutes;
