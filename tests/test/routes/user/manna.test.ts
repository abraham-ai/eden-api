import { prepareUserHeaders, prepareAdminHeaders } from "../../../util";
import { ObjectId } from "@fastify/mongodb";
import { test, expect } from "vitest";
import { Transaction } from "@/models/Transaction";
import { FastifyInstance } from "fastify";
import { MANNA_BASE_ROUTE } from "@/routes/user/mannaRoutes";

const addMannaRequest = async (server: FastifyInstance, userId: string, amount: number) => {
  const headers = prepareAdminHeaders();
  const response = await server.inject({
    method: 'POST',
    url: MANNA_BASE_ROUTE,
    payload: {
      userId,
      amount,
    },
    headers,
  });
  return response;
}

const getMannaBalanceRequest = async (server: FastifyInstance) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: MANNA_BASE_ROUTE,
    headers,
  });
  return response;
}

test('Admin can add Manna', async (context) => {
  const { server } = context;
  const response = await addMannaRequest(server, 'user', 100);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('userId');
  expect(response.json()).toHaveProperty('manna');
  expect(response.json()).toHaveProperty('transactionId');
  expect(response.json().manna).toBe(100);

  // Get the transaction from the database
  const transactionId = new ObjectId(response.json().transactionId)
  const transaction = await Transaction.findById(transactionId);
  expect(transaction).not.toBe(null)
});

test('A user without manna should see a zero balance', async (context) => {
  const { server } = context;
  const response = await getMannaBalanceRequest(server);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('manna');
  expect(response.json().manna).toBe(0);
});

test('A user with manna should see their balance', async (context) => {
  const { server } = context;
  await addMannaRequest(server, 'user', 100);
  const response = await getMannaBalanceRequest(server);
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('manna');
  expect(response.json().manna).toBe(100);
});