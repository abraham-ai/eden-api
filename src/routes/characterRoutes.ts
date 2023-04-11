import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

// import { isAuth } from "../middleware/authMiddleware";

import { 
  getCharacters, 
  getCharacter, 
} from "../controllers/characterController";


const characterRoutes: FastifyPluginAsync = async (server) => {

  server.get('/characters', {
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
          characters: Type.Array(Type.Any()),
        }
      },
    },
    handler: (request, reply) => getCharacters(request, reply),
  });

  server.get('/character/:characterId', {
    schema: {
      response: {
        200: {
          character: Type.Any(),
        }
      },
    },
    handler: (request, reply) => getCharacter(request, reply),
  });

}

export default characterRoutes;