import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';

import { listGenerators, registerGenerator, deprecateGenerator } from "../controllers/generatorController";
import { isAdmin } from "../middleware/authMiddleware";

const baseRoute = '/generators';

const generatorRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${baseRoute}`, {
    schema: {
      response: {
        200: {
          generators: Type.Array(Type.Object({
            generatorName: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              defaultParameters: Type.Any(),
            })),
          })),
        }
      }
    },
    handler: (_, reply) => listGenerators(reply),
  });
  server.post(`${baseRoute}/register`, {
    schema: {
      request: {
        body: Type.Object({
          generatorName: Type.String(),
          versionId: Type.String(),
          defaultParameters: Type.Any(),
          creationAttributes: Type.Array(Type.String()),
        }),
      },
      response: {
        200: Type.Object({
          generatorName: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => registerGenerator(request, reply),
  });
  server.post(`${baseRoute}/deprecate`, {
    schema: {
      request: {
        body: Type.Object({
          generatorName: Type.String(),
          versionId: Type.String(),
          }),
      },
      response: {
        200: Type.Object({
          generatorName: Type.String(),
          versionId: Type.String(),
        }),
      },
    },
    preHandler: [async (request) => isAdmin(server, request)],
    handler: (request, reply) => deprecateGenerator(request, reply),
  });
}

export default generatorRoutes;