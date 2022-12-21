import { loginAsUser } from "@/../tests/util";
import { expect, test } from "vitest";

test('User can list generators', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'GET',
    url: '/generators/list',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  const { generators } = response.json();
  expect(generators).toHaveLength(1);
  expect(generators[0]).toHaveProperty('service');
  expect(generators[0]).toHaveProperty('name');
  expect(generators[0]).toHaveProperty('versions');
  expect(generators[0].versions).toHaveLength(1);
  expect(generators[0].versions[0]).toHaveProperty('versionId');
  expect(generators[0].versions[0]).toHaveProperty('isDeprecated');
})