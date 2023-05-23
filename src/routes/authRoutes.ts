import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { login } from '../controllers/authController';

export interface AuthLoginRequestBody {
  address: string;
  message: string;
  signature: string;
}

export const AUTH_BASE_ROUTE = '/auth';

const authRoutes: FastifyPluginAsync = async (server) => {

  server.post(`${AUTH_BASE_ROUTE}/login`, {
    schema: {
      body: Type.Object({
        address: Type.String(),
        message: Type.String(),
        signature: Type.String(),
      }),
      response: {
        200: Type.Object({
          token: Type.String(),
        }),
      },
    },
    handler: (request, reply) => login(request, reply),
  });

  // server.post(`${AUTH_BASE_ROUTE}/challenge`, {
  //   schema: {
  //     body: Type.Object({
  //       address: Type.String(),
  //     }),
  //     response: {
  //       200: Type.Object({
  //         message: Type.String(),
  //       }),
  //     },
  //   },
  //   preHandler: [(request) => isAdmin(server, request)],
  //   handler: (request, reply) => createChallenge(request, reply),
  // });
}

export default authRoutes;
