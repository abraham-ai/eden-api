import { FastifyInstance } from "fastify";
import { test, expect } from "vitest";
import { CHARACTER_BASE_ROUTE } from "../../../src/routes/characterRoutes";
import { createCharacter, prepareUserHeaders } from "../../util";

const getCharacters = async (server: FastifyInstance, userId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: CHARACTER_BASE_ROUTE,
    headers,
    query: {
      userId
    }
  });
  return response;
}

const getCharacter = async (server: FastifyInstance, characterId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: `${CHARACTER_BASE_ROUTE}/${characterId}`,
    headers
  });
  return response;
}

test('A user can get their characters', async (context) => {
  const { server } = context;
  await createCharacter();
  const response = await getCharacters(server, 'user');
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveLength(1);
})

test('Able to get a character by id', async (context) => {
  const { server } = context;
  const character = await createCharacter();
  const response = await getCharacter(server, character._id);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('character');
})