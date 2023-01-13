import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { login } from '../controllers/authController';

const baseRoute = '/auth';


const authRoutes: FastifyPluginAsync = async (server) => {
  server.post(`${baseRoute}/login`, {
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
          token: Type.String(),
        }),
      },
    },
    handler: (request, reply) => login(server, request, reply),
  });
}

export default authRoutes;
