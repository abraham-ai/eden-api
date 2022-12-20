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