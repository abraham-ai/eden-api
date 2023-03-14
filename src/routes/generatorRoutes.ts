import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';

import { isAdmin } from "../middleware/authMiddleware";

import { 
  getGenerator, 
  getGenerators, 
  registerGenerator, 
  deprecateGenerator
} from "../controllers/generatorController";


const generatorRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/generator/:generatorName', {
    schema: {
      response: {
        200: Type.Object({
          generator: Type.Any(),
        }),
      }
    },
    handler: (request, reply) => getGenerator(request, reply),
  });

  server.get('/generators', {
    schema: {
      response: {
        200: {
          generators: Type.Array(Type.Object({
            generatorName: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              parameters: Type.Any(),
            })),
            description: Type.String(),
            output: Type.String(),
          })),
        }
      }
    },
    handler: (_, reply) => getGenerators(reply),
  });

  server.post('/generators/register', {
    schema: {
      request: {
        body: Type.Object({
          generatorName: Type.String(),
          provider: Type.String(),
          address: Type.String(),
          versionId: Type.String(),
          mode: Type.String(),
          parameters: Type.Any(),
          creationAttributes: Type.Array(Type.String()),
        }),
      },
      response: {
        200: Type.Object({
          generator: Type.Object({
            generatorName: Type.String(),
            versionId: Type.String(),
          }),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => registerGenerator(request, reply),
  });

  server.post('/generators/deprecate', {
    schema: {
      request: {
        body: Type.Object({
          generatorName: Type.String(),
          versionId: Type.String(),
        }),
      },
      response: {
        200: Type.Object({
          generator: Type.Object({
            generatorName: Type.String(),
            versionId: Type.String(),
          }),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => deprecateGenerator(request, reply),
  });

}

export default generatorRoutes;