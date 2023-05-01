import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

// import { isAuth } from "../middleware/authMiddleware";

import { 
  getMint, 
  getMints, 
} from "../controllers/mintsController";


const mintRoutes: FastifyPluginAsync = async (server) => {

  server.get('/mints', {
    schema: {
      querystring: {
        userId: {
          type: "string",
        }
      },
      response: {
        200: {
          livemints: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getMints(request, reply),
  });

  server.get('/mint/:mintId', {
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