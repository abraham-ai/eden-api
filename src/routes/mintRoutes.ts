import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getMint, 
  getMints, 
} from "../controllers/mintController";

export const MINT_BASE_ROUTE = '/mints';

export interface MintListQuery {
  userId: string;
}

export interface MintGetQuery {
  mintId: string;
}

const mintRoutes: FastifyPluginAsync = async (server) => {
  server.get(`${MINT_BASE_ROUTE}/list`, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        }
      },
      response: {
        200: Type.Object({
          mints: Type.Array(Type.Any()),
        }),
      },
    },
    handler: (request, reply) => getMints(request, reply),
  });

  server.get(`${MINT_BASE_ROUTE}/get`, {
    schema: {
      response: {
        200: {
          mint: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getMint(request, reply),
  });

}

export default mintRoutes;