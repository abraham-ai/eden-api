import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { login } from '../../controllers/user/authController';

export interface LoginRequestBody {
  address: string;
  message: string;
  signature: string;
}

export const AUTH_BASE_ROUTE = '/user/login';

const authRoutes: FastifyPluginAsync = async (server) => {

  server.post(AUTH_BASE_ROUTE, {
    schema: {
      body: Type.Object({
        address: Type.String(),
        message: Type.String(),
        signature: Type.String(),
      }),
      response: {
        200: Type.Object({
          userId: Type.String(),
          username: Type.String(),
          token: Type.String(),
          newUser: Type.Boolean(),
        }),
      },
    },
    handler: (request, reply) => login(request, reply),
  });

}

export default authRoutes;
