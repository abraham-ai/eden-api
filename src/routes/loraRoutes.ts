import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getLoras, 
  getLora, 
} from "../controllers/loraController";

export const LORA_BASE_ROUTE = '/loras';

export interface LoraListQuery {
  userId: string;
}

export interface LoraGetQuery {
  loraId: string;
}


const loraRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${LORA_BASE_ROUTE}/list`, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        },
      },
      response: {
        200: Type.Object({
          loras: Type.Array(Type.Any()),
        }),
      },
    },
    handler: (request, reply) => getLoras(request, reply),
  });

  server.get(`${LORA_BASE_ROUTE}/get`, {
    schema: {
      querystring: {
        loraId: Type.String(),
      },
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