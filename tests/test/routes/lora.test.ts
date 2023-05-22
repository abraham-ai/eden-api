import { FastifyInstance } from "fastify";
import { test, expect } from "vitest";
import { LORA_BASE_ROUTE } from "../../../src/routes/loraRoutes";
import { createLora, prepareUserHeaders } from "../../util";

const getLoras = async (server: FastifyInstance, userId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: LORA_BASE_ROUTE,
    headers,
    query: {
      userId
    }
  });
  return response;
}

const getLora = async (server: FastifyInstance, loraId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: `${LORA_BASE_ROUTE}/${loraId}`,
    headers
  });
  return response;
}

test('A user can get their loras', async (context) => {
  const { server } = context;
  await createLora();
  const response = await getLoras(server, 'user');
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveLength(1);
})

test('Able to get a lora by id', async (context) => {
  const { server } = context;
  const lora = await createLora();
  const response = await getLora(server, lora._id);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('lora');
})