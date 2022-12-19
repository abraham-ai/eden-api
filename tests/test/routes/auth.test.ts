import { createTestServer } from "@/../tests/util";
import { expect, test } from "vitest";

test('User can login with API Key', async () => {
  const server = await createTestServer()
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login/api-key',
    payload: {
      apiKey: 'user',
      apiSecret: 'user',
    },
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toHaveProperty('token')
})