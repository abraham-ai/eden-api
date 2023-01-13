import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { isAdmin, isAuth } from '../middleware/authMiddleware';
import { modifyCredits, getBalance } from '../controllers/creditsController';

const routeRoot = '/credits'

const creditsRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${routeRoot}`, {
    schema: {
      response: {
        200: Type.Object({
          balance: Type.Number(),
        }),
      },
    },
    preHandler: [(request) => isAuth(server, request)],
    handler: (request, reply) => getBalance(server, request, reply),
  })
  server.post(`${routeRoot}/modify`, {
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
    preHandler: [(request) => isAdmin(server, request)],
    handler: (request, reply) => modifyCredits(server, request, reply),
  })
}

export default creditsRoutes;
