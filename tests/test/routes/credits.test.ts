import { getDb, loginAsAdmin, loginAsUser } from "@/../tests/util";
import { ObjectId } from "@fastify/mongodb";
import { test, expect } from "vitest";

test('Admin can add credits', async (context) => {
  const { server } = context;
  const token = await loginAsAdmin(server);
  const response = await server.inject({
    method: 'POST',
    url: '/credits/add',
    payload: {
      userId: 'user',
      amount: 100,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('userId');
  expect(response.json()).toHaveProperty('balance');
  expect(response.json()).toHaveProperty('transactionId');
  expect(response.json().balance).toBe(100);

  // Get the transaction from the database
  const db = getDb(server)
  const transactionId = new ObjectId(response.json().transactionId)
  const transaction = await db.collection('transactions').findOne({ _id: transactionId })
  expect(transaction).not.toBe(null)
});

test('User can check their balance', async (context) => {
  const { server } = context;
  const token = await loginAsUser(server);
  const response = await server.inject({
    method: 'GET',
    url: '/credits/balance',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response)
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('balance');
  expect(response.json().balance).toBe(100);
});