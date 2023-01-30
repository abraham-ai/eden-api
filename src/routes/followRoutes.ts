import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getFollowing, 
  getFollowers, 
} from "../controllers/followController";


const followRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/following/:userId', {
    schema: {
      response: {
        200: {
          following: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getFollowing(request, reply),
  });

  server.get('/followers/:userId', {
    schema: {
      response: {
        200: {
          followers: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getFollowers(request, reply),
  });

}

export default followRoutes;