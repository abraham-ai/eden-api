import { getDb, prepareUserHeaders, prepareAdminHeaders } from "../../util";
import { ObjectId } from "@fastify/mongodb";
import { test, expect } from "vitest";
import { Transaction } from "@/models/Transaction";

test('Admin can add credits', async (context) => {
  const { server } = context;
  const headers = prepareAdminHeaders();
  const response = await server.inject({
    method: 'POST',
    url: '/credits/modify',
    payload: {
      userId: 'user',
      amount: 100,
    },
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('userId');
  expect(response.json()).toHaveProperty('balance');
  expect(response.json()).toHaveProperty('transactionId');
  expect(response.json().balance).toBe(100);

  // Get the transaction from the database
  const transactionId = new ObjectId(response.json().transactionId)
  const transaction = await Transaction.findById(transactionId);
  expect(transaction).not.toBe(null)
});

test('User can check their credit balance', async (context) => {
  const { server } = context;
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: '/credits',
    headers,
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('balance');
  expect(response.json().balance).toBe(100);
});