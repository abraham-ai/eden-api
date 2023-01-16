import { getCreations } from "../controllers/creationsController";
import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

const baseRoute = '/creations';

const creationRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${baseRoute}`, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        }
      },
      response: {
        200: {
          creations: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCreations(request, reply),
  });
}

export default creationRoutes;