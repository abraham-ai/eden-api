import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getCreation, 
  getCreations 
} from "../controllers/creationsController";


const creationRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/creation/:creationId', {
    schema: {
      response: {
        200: {
          creation: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCreation(request, reply),
  });
  
  server.post('/creations', {
    schema: {
      request: {
        body: Type.Object({
          generators: Type.Array(Type.String()),
          creatorId: Type.String(),
          collectionId: Type.String(),
          earliestTime: Type.Any(),
          latestTime: Type.Any(),
          limit: Type.Number(),
        }),
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