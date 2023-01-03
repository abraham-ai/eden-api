import { FastifyPluginAsync } from "fastify";
import { Type } from '@sinclair/typebox';

import { listGenerators } from "../controllers/generatorController";

const baseRoute = '/generators';

const generatorRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${baseRoute}/list`, {
    schema: {
      response: {
        200: {
          generators: Type.Array(Type.Object({
            generatorId: Type.String(),
            versions: Type.Array(Type.Object({
              versionId: Type.String(),
              defaultConfig: Type.Any(),
            })),
          })),
        }
      }
    },
    handler: (_, reply) => listGenerators(server, reply),
  });
}

export default generatorRoutes;