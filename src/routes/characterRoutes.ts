import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getCharacters, 
  getCharacter, 
} from "../controllers/characterController";
import { CharacterDocument } from "../models/Character";


export const CHARACTER_BASE_ROUTE = '/characters';

const characterRoutes: FastifyPluginAsync = async (server) => {

  server.get(CHARACTER_BASE_ROUTE, {
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

  server.get(`${CHARACTER_BASE_ROUTE}/:characterId`, {
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