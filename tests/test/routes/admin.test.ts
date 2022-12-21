import { loginAsAdmin } from "@/../tests/util";
import { test, expect } from "vitest";

test('Admin can create a new user', async (context) => {
  const { server } = context;
  const token = await loginAsAdmin(server);
  const response = await server.inject({
    method: 'POST',
    url: '/admin/create-user',
    payload: {
      userId: 'cooluser',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('userId');
  expect(response.json()).toHaveProperty('apiKey');
  expect(response.json()).toHaveProperty('apiSecret');
});

test('Admin can register a new generator', async (context) => {
  const { server } = context;
  const token = await loginAsAdmin(server);
  const response = await server.inject({
    method: 'POST',
    url: '/admin/generators/register',
    payload: {
      generatorId: 'test2',
      versionId: '1.0.0',
      defaultConfig: {
        foo: 'bar',
      }
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorId');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
});

test('Admin can register a new version of a generator', async (context) => {
  const { server } = context;
  const token = await loginAsAdmin(server);
  const response = await server.inject({
    url: '/admin/generators/register',
    method: 'POST',
    payload: {
      generatorId: 'test2',
      versionId: '1.0.1',
      defaultConfig: {
        foo: 'bar',
      }
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorId');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
  expect(generators[1].versions).toHaveLength(2);
});

test('Admin can deprecate a generator version', async (context) => {
  const { server } = context;
  const token = await loginAsAdmin(server);
  const response = await server.inject({
    url: '/admin/generators/deprecate',
    method: 'POST',
    payload: {
      generatorId: 'test2',
      versionId: '1.0.0',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorId');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
  expect(generators[1].versions).toHaveLength(1);
});