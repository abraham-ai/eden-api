import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { isAdmin, isAuth } from '../../middleware/authMiddleware';
import { 
  modifyManna, 
  getBalance,
  redeemMannaVoucher,
  createMannaVoucher,
} from '../../controllers/user/mannaController';


const mannaRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/user/manna/balance', {
    schema: {
      response: {
        200: Type.Object({
          manna: Type.Number(),
        }),
      },
    },
    preHandler: [(request) => isAuth(server, request)],
    handler: (request, reply) => getBalance(request, reply),
  });

  server.post('/user/manna/create', {
    schema: {      
      request: {
        body: Type.Object({
          allowedUsers: Type.Array(Type.String()) || Type.Null(),
          balance: Type.Number(),
        }),
      },
      response: {
        200: Type.Object({          
          mannaVoucher: Type.String(),
        }),
      },

    },
    preHandler: [(request) => isAdmin(server, request)],
    handler: (request, reply) => createMannaVoucher(request, reply),
  });

  server.post('/user/manna/update', {
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
    handler: (request, reply) => modifyManna(request, reply),
  });

  server.post('/user/manna/redeem', {
    schema: {
      request: {
        body: Type.Object({
          mannaVoucherId: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          balance: Type.Number(),
          transactionId: Type.String(),
        }),
      },
    },
    preHandler: [(request) => isAuth(server, request)],
    handler: (request, reply) => redeemMannaVoucher(request, reply),
  });

}

export default mannaRoutes;
