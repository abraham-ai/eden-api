import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { login } from '../../controllers/user/authController';


const authRoutes: FastifyPluginAsync = async (server) => {

  server.post('/user/login', {
    schema: {
      request: {
        body: Type.Object({
          address: Type.String(),
          message: Type.String(),
          signature: Type.String(),
        }),
      },
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
