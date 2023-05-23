import { createCreation, prepareUserHeaders } from "../../util";
import { expect, test } from "vitest";


test('User can list creations', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: '/creations',
    headers
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('creations');
  expect(response.json().creations.length).toBeGreaterThan(0);
})

test('User can get a creation by ID', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const creation = await createCreation();
  const response = await server.inject({
    method: 'GET',
    url: `/creations/${creation.id}`,
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('creation');
});