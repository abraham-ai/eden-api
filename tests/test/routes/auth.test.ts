import { expect, test } from "vitest";

test('User can login with Ethereum Wallet', async (context) => {
  const { server } = context
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: '0xCB61f141D37C320B4357173ec28Af37A5E09d949',
      message: 'This is a test message. Hey there.',
      signature: '0xd36f7dc7213d0d5d2e6a8bfc4bb4f64f835dd362f6b61e2c14a3aa08245b1eae78262a83e05490313f2cfa20a7b2e6380235dcf59bd30a3c9a989a46916bcd381b'
    },
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toHaveProperty('token')
})

test('Invalid Ethereum Wallet login does not return token', async (context) => {
  const { server } = context
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: '0xCB61f141D37C320B4357173ec28Af37A5E09d948',
      message: 'This is a test message. Hey there.',
      signature: '0xd36f7dc7213d0d5d2e6a8bfc4bb4f64f835dd362f6b61e2c14a3aa08245b1eae78262a83e05490313f2cfa20a7b2e6380235dcf59bd30a3c9a989a46916bcd381b'
    },
  })
  expect(response.statusCode).toBe(400)
})
