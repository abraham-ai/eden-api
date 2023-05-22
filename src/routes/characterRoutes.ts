import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

import { 
  getCharacters, 
  getCharacter, 
} from "../controllers/characterController";


export const CHARACTER_BASE_ROUTE = '/characters';

export interface GetCharactersQuery {
  userId: string;
}

export interface GetCharacterQuery {
  characterId: string;
}

const characterRoutes: FastifyPluginAsync = async (server) => {

  server.get(`${CHARACTER_BASE_ROUTE}/list`, {
    schema: {
      querystring: {
        userId: {
          type: "string",
        },
      },
      response: {
        200: Type.Object({
          characters: Type.Array(Type.Any()),
        }),
      },
    },
    handler: (request, reply) => getCharacters(request, reply),
  });

  server.get(`${CHARACTER_BASE_ROUTE}/get`, {
    schema: {
      querystring: {
        characterId: Type.String(),
      },
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