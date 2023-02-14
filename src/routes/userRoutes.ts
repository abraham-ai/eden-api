import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { isAdmin, isAuth } from '../middleware/authMiddleware';
import { getUser, updateUser } from '../controllers/userController';

const routeRoot = '/user'

const userRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${routeRoot}`, {
    schema: {
      response: {
        200: Type.Object({
         
        }),
      },
    },
    preHandler: [(request) => isAuth(server, request)],
    handler: (request, reply) => getUser(request, reply),
  })
  server.put(`${routeRoot}/update`, {
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
    handler: (request, reply) => updateUser(request, reply),
  })
}

export default userRoutes;
