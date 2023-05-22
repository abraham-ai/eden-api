import { FastifyInstance } from "fastify";
import { test, expect } from "vitest";
import { MINT_BASE_ROUTE } from "../../../src/routes/mintRoutes";
import { createMint, prepareUserHeaders } from "../../util";

const getMints = async (server: FastifyInstance, userId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: MINT_BASE_ROUTE,
    headers,
    query: {
      userId
    }
  });
  return response;
}

const getMint = async (server: FastifyInstance, mintId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: `${MINT_BASE_ROUTE}/${mintId}`,
    headers
  });
  return response;
}

test('A user can get their mints', async (context) => {
  const { server } = context;
  await createMint();
  const response = await getMints(server, 'user');
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveLength(1);
})

test('Able to get a mint by id', async (context) => {
  const { server } = context;
  const mint = await createMint();
  const response = await getMint(server, mint._id);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('mint');
})