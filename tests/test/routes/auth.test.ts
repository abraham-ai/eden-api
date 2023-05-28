import { ethers } from "ethers";
import { FastifyInstance } from "fastify";
import { expect, test } from "vitest";

const TEST_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
const TEST_ADDRESS_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

const signMessage = async (message: string) => {
  const provider = ethers.getDefaultProvider('mainnet');
  const wallet = new ethers.Wallet(TEST_ADDRESS_PK, provider)
  const signature = await wallet.signMessage(message);
  return signature;
};

const createNonceRequest = async (server: FastifyInstance, address: string) => {
  const response = await server.inject({
    method: "POST",
    url: "/auth/challenge",
    payload: {
      address,
    },
  });
  return response
};


test("User can create a challenge for a wallet", async (context) => {
  const { server } = context;
  const response = await createNonceRequest(server, TEST_ADDRESS);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty("nonce");
});

test('User can login with Ethereum Wallet', async (context) => {
  const { server } = context
  const nonceResponse = await createNonceRequest(server, TEST_ADDRESS)
  const nonce = nonceResponse.json().nonce
  const signature = await signMessage(nonce)
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: TEST_ADDRESS,
      message: nonce,
      signature: signature,
    },
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toHaveProperty('token')
})

test('User cannot login with invalid signature', async (context) => {
  const { server } = context
  const nonceResponse = await createNonceRequest(server, TEST_ADDRESS)
  const nonce = nonceResponse.json().nonce
  const signature = await signMessage(nonce + 'invalid')
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: TEST_ADDRESS,
      message: nonce,
      signature: signature,
    },
  })
  expect(response.statusCode).toBe(400)
  expect(response.json()).toHaveProperty('message')
  expect(response.json().message).toBe('Signature is invalid')
})

test('User cannot login without a challenge', async (context) => {
  const { server } = context
  const signature = await signMessage('invalid')
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: TEST_ADDRESS,
      message: 'invalid',
      signature: signature,
    },
  })
  expect(response.statusCode).toBe(400)
  expect(response.json()).toHaveProperty('message')
  expect(response.json().message).toBe('No challenge found for this address')
})

test('User cannot login with the same challenge twice', async (context) => {
  const { server } = context
  const nonceResponse = await createNonceRequest(server, TEST_ADDRESS)
  const nonce = nonceResponse.json().nonce
  const signature = await signMessage(nonce)
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: TEST_ADDRESS,
      message: nonce,
      signature: signature,
    },
  })
  expect(response.statusCode).toBe(200)
  expect(response.json()).toHaveProperty('token')
  const response2 = await server.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      address: TEST_ADDRESS,
      message: nonce,
      signature: signature,
    },
  })
  expect(response2.statusCode).toBe(400)
  expect(response2.json()).toHaveProperty('message')
  expect(response2.json().message).toBe('Challenge has already been used')
})

// TODO: test cannot login with expired challenge