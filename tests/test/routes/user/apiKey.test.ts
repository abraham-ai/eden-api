import { API_KEY_BASE_ROUTE } from "../../../../src/routes/user/apiKeyRoutes";
import { prepareUserHeaders } from "../../../util";
import { test, expect } from "vitest";

const createApiKey = async (server) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'POST',
    url: API_KEY_BASE_ROUTE,
    headers,
    payload: {
      "note": "for testing"
    }
  });
  return response;
}

const getApiKeys = async (server) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: API_KEY_BASE_ROUTE,
    headers
  });
  return response;
}

const deleteApiKey = async (server, apiKey) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'DELETE',
    url: `${API_KEY_BASE_ROUTE}/${apiKey}`,
    headers
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
  expect(json.apiKey).toHaveProperty('note');
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
  expect(deleteResponse.statusCode).toBe(204);
  const getResponse2 = await getApiKeys(server);
  expect(getResponse2.json()).toHaveLength(1);
})