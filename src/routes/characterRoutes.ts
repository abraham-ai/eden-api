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

export interface GetCharacterParams {
  characterId: string;
}

const characterRoutes: FastifyPluginAsync = async (server) => {

  server.get(CHARACTER_BASE_ROUTE, {
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