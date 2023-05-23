import { prepareUserHeaders } from "../../util";
import { test, expect } from "vitest";
import { FastifyInstance } from "fastify";

const createApiKey = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/apikeys/create',
    headers,
    payload: {}
  });
  return response;
}

const getApiKeys = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: '/apikeys/list',
    headers
  });
  return response;
}

const deleteApiKey = async (server: FastifyInstance, apiKey: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/apikeys/delete',
    headers,
    payload: {
      apiKey
    }
  });
  return response;
}

test('User can create an API Key', async (context) => {
  const { server } = context;
  const response = await createApiKey(server);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveProperty('apiKey');
  expect(json.apiKey).toHaveProperty('apiKey');
  expect(json.apiKey).toHaveProperty('apiSecret');
})

test('User can list their API Keys', async (context) => {
  const { server } = context;
  const response = await getApiKeys(server);
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveLength(1);
})

test('User can delete an API Key', async (context) => {
  const { server } = context;
  await createApiKey(server);
  const getResponse = await getApiKeys(server);
  const apiKeys = getResponse.json();
  const apiKey = apiKeys[1].apiKey;
  const deleteResponse = await deleteApiKey(server, apiKey);
  expect(deleteResponse.statusCode).toBe(200);
  const getResponse2 = await getApiKeys(server);
  expect(getResponse2.json()).toHaveLength(1);
})