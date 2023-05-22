import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getMint, 
  getMints, 
} from "../controllers/mintsController";

export const MINT_BASE_ROUTE = '/mints';

export interface GetMintsQuery {
  userId: string;
}

export interface GetMintParams {
  mintId: string;
}

const mintRoutes: FastifyPluginAsync = async (server) => {
  server.get(MINT_BASE_ROUTE, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        }
      },
      response: {
        200: Type.Array(Type.Any()),
      },
    },
    handler: (request, reply) => getMints(request, reply),
  });

  server.get(`${MINT_BASE_ROUTE}/:mintId`, {
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