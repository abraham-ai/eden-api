import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getCreator, 
  getCreators 
} from "../controllers/creatorsController";


const creatorRoutes: FastifyPluginAsync = async (server) => {
  
  server.get('/creator/:username', {
    schema: {
      response: {
        200: {
          creator: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCreator(request, reply),
  });
  
  server.post('/creators', {
    schema: {
      request: {
        userIds: Type.Array(Type.String()),
      },
      response: {
        200: {
          creators: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCreators(request, reply),
  });

}

export default creatorRoutes;