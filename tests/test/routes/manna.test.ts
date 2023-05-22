import { prepareUserHeaders, prepareAdminHeaders, getDefaultUserId } from "../../util";
import { ObjectId } from "@fastify/mongodb";
import { test, expect } from "vitest";
import { Transaction } from "@/models/Transaction";
import { FastifyInstance } from "fastify";
import { MANNA_BASE_ROUTE } from "@/routes/mannaRoutes";

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

const createMannaVoucherRequest = async (server: FastifyInstance, amount: number, allowedUsers?: string[]) => {
  const headers = prepareAdminHeaders();
  let users;
  if (allowedUsers) {
    users = allowedUsers
  } else {
    const user = await getDefaultUserId();
    users = [user];
  }
  const response = await server.inject({
    method: 'POST',
    url: `${MANNA_BASE_ROUTE}/vouchers`,
    payload: {
      allowedUsers: users,
      amount,
    },
    headers,
  });
  return response;
}

const redeemMannaVoucherRequest = async (server: FastifyInstance, voucherId: string) => {
  const headers = prepareUserHeaders();
  const response = await server.inject({
    method: 'GET',
    url: `${MANNA_BASE_ROUTE}/vouchers/${voucherId}/redeem`,
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

test('Admin can create a manna voucher', async (context) => {
  const { server } = context;
  const response = await createMannaVoucherRequest(server, 100);
  console.log(response.json())
  expect(response.statusCode).toBe(200);
  expect(response.json()).toHaveProperty('mannaVoucher');
})

// test('User can redeem a manna voucher, and it creates a transaction', async (context) => {
//   const { server } = context;
//   const createVoucherResponse = await createMannaVoucherRequest(server, 100);
//   const voucherId = createVoucherResponse.json().voucherId
//   const redeemResponse = await redeemMannaVoucherRequest(server, voucherId);
//   expect(redeemResponse.statusCode).toBe(200);
//   expect(redeemResponse.json()).toHaveProperty('manna');
//   expect(redeemResponse.json().manna).toBe(100);
//   expect(redeemResponse.json()).toHaveProperty('transactionId');

//   // Get the transaction from the database
//   const transactionId = new ObjectId(redeemResponse.json().transactionId)
//   const transaction = await Transaction.findById(transactionId);
//   expect(transaction).not.toBe(null)
// })

// test('User cannot redeem a manna voucher twice', async (context) => {
//   const { server } = context;
//   const createVoucherResponse = await createMannaVoucherRequest(server, 100);
//   const voucherId = createVoucherResponse.json().voucherId
//   const redeemResponse = await redeemMannaVoucherRequest(server, voucherId);
//   expect(redeemResponse.statusCode).toBe(200);
//   const redeemResponse2 = await redeemMannaVoucherRequest(server, voucherId);
//   expect(redeemResponse2.statusCode).toBe(400);
// })

// test('User cannot redeem a manna voucher that does not exist', async (context) => {
//   const { server } = context;
//   const redeemResponse = await redeemMannaVoucherRequest(server, '123');
//   expect(redeemResponse.statusCode).toBe(404);
// })

// test('User cannot redeem a manna voucher they are not allowed to', async (context) => {
//   const { server } = context;
//   const createVoucherResponse = await createMannaVoucherRequest(server, 100, ['user2']);
//   const voucherId = createVoucherResponse.json().voucherId
//   const redeemResponse = await redeemMannaVoucherRequest(server, voucherId);
//   expect(redeemResponse.statusCode).toBe(403);
// })