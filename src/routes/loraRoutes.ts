import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

// import { isAuth } from "../middleware/authMiddleware";

import { 
  getLoras, 
  getLora, 
} from "../controllers/loraController";


const loraRoutes: FastifyPluginAsync = async (server) => {

  server.get('/loras', {
    schema: {
      querystring: {
        userId: {
          type: "string",
        },
        username: {
          type: "string",
        }
      },
      response: {
        200: {
          loras: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getLoras(request, reply),
  });

  server.get('/lora/:loraId', {
    schema: {
      response: {
        200: {
          lora: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getLora(request, reply),
  });

}

export default loraRoutes;