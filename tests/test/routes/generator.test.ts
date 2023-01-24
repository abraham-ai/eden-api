import { prepareAdminHeaders, prepareUserHeaders } from "../../util";
import { expect, test } from "vitest";

test('User can list generators', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: '/generators',
    headers
  });
  expect(response.statusCode).toBe(200);
  const { generators } = response.json();
  expect(generators).toHaveLength(1);
  expect(generators[0]).toHaveProperty('generatorName');
  expect(generators[0]).toHaveProperty('versions');
  expect(generators[0].versions).toHaveLength(1);
  expect(generators[0].versions[0]).toHaveProperty('versionId');
  expect(generators[0].versions[0]).toHaveProperty('parameters');
})

test('Admin can register a new generator', async (context) => {
  const { server } = context;
  const headers = prepareAdminHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/generators/register',
    payload: {
      generatorName: 'test2',
      versionId: '1.0.0',
      defaultConfig: {
        foo: 'bar',
      }
    },
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorName');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators',
    headers
  });
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
});

test('Admin can register a new version of a generator', async (context) => {
  const { server } = context;
  const headers = prepareAdminHeaders();
  const response = await server.inject({
    url: '/generators/register',
    method: 'POST',
    payload: {
      generatorName: 'test2',
      versionId: '1.0.1',
      defaultConfig: {
        foo: 'bar',
      }
    },
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorName');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators',
    headers
  });
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
  expect(generators[1].versions).toHaveLength(2);
});

test('Admin can deprecate a generator version', async (context) => {
  const { server } = context;
  const headers = prepareAdminHeaders();
  const response = await server.inject({
    url: '/generators/deprecate',
    method: 'POST',
    payload: {
      generatorName: 'test2',
      versionId: '1.0.0',
    },
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('generatorName');
  expect(response.json()).toHaveProperty('versionId');

  const response2 = await server.inject({
    method: 'GET',
    url: '/generators',
    headers
  });
  
  expect(response2.statusCode).toBe(200);
  const { generators } = response2.json();
  expect(generators).toHaveLength(2);
  expect(generators[1].versions).toHaveLength(1);
});