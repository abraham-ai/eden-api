import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getLoras, 
  getLora, 
} from "../controllers/loraController";

export const LORA_BASE_ROUTE = '/loras';

export interface GetLorasQuery {
  userId: string;
}

export interface GetLoraParams {
  loraId: string;
}


const loraRoutes: FastifyPluginAsync = async (server) => {
  server.get(LORA_BASE_ROUTE, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        },
      },
      response: {
        200: Type.Array(Type.Any()),
      },
    },
    handler: (request, reply) => getLoras(request, reply),
  });

  server.get(`${LORA_BASE_ROUTE}/:loraId`, {
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