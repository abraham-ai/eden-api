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
  
  server.get('/creations', {
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