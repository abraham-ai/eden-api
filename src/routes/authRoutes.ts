import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { loginApiKey, loginWallet } from '@/controllers/authController';

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
  server.post(`${baseRoute}/login/wallet`, {
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
    handler: (request, reply) => loginWallet(server, request, reply),
  });
}

export default authRoutes;
