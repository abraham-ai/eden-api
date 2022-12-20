import { loginAsUser } from "@/../tests/util";
import { test, expect } from "vitest";

test('User can create an API Key', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'POST',
    url: '/api-key/create',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('apiKey');
  expect(response.json()).toHaveProperty('apiSecret');
})

test('User can list their API Keys', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'GET',
    url: '/api-key/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  const json = response.json();
  expect(json).toHaveLength(2);
})

test('User can delete an API Key', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  let apiKeys = await server.inject({
    method: 'GET',
    url: '/api-key/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(apiKeys.json()).toHaveLength(2);
  const apiKey = apiKeys.json()[1].apiKey;
  const response = await server.inject({
    method: 'POST',
    url: '/api-key/delete',
    payload: {
      apiKey
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  let json = response.json();
  expect(json).toHaveProperty('apiKey');

  apiKeys = await server.inject({
    method: 'GET',
    url: '/api-key/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  json = apiKeys.json();
  expect(json).toHaveLength(1);
})