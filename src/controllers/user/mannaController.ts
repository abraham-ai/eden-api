import { FastifyRequest, FastifyReply } from "fastify";
import { randomId } from "../../lib/util";

import { Manna } from "../../models/Manna";
import { MannaVoucher } from "../../models/MannaVoucher";
import { Transaction } from "../../models/Transaction";
import { User } from "../../models/User";


interface ModifyMannaRequest extends FastifyRequest {
  body: {
    userId: string;
    amount: number;
  }
}

export const modifyManna = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, amount } = request.body as ModifyMannaRequest["body"];

  if (!userId || !amount) {
    return reply.status(400).send({
      message: "Missing userId or amount",
    });
  }

  const user = await User.findOne({userId})

  if (!user) {
    return reply.status(400).send({
      message: `User ${userId} not found`,
    });
  }

  const manna = await Manna.findOne({
    user: user._id,
  });
  let newManna;

  if (!manna) {
    newManna = new Manna({
      user: user._id,
      balance: amount,
    });
    await newManna.save();
  } else {
    manna.balance += amount;
    await manna.save();
    newManna = manna;
  }

  const transaction = new Transaction({
    manna: newManna._id,
    amount,
  })
  await transaction.save();

  return reply.status(200).send({
    userId,
    balance: newManna.balance,
    transactionId: transaction._id
  });
};

interface CreateMannaVoucherRequest extends FastifyRequest {
  body: {
    allowedUsers: string[] | undefined;
    balance: number;
  }
}

export const createMannaVoucher = async (request: FastifyRequest, reply: FastifyReply) => {
  const { allowedUsers, balance } = request.body as CreateMannaVoucherRequest["body"];

  if (!balance) {
    return reply.status(400).send({
      message: "Missing balance",
    });
  }

  const code = randomId(8);

  const mannaVoucher = new MannaVoucher({
    used: false,
    allowedUsers,
    balance,
    code,    
  });
  mannaVoucher.save();

  return reply.status(200).send({
    mannaVoucher: mannaVoucher.code,
  });
}


export const getBalance = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;

  const user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: `User ${userId} not found`,
    });
  }

  const manna = await Manna.findOne({
    user: user._id,
  });

  if (!manna) {
    return reply.status(200).send({
      manna: 0,
    });
  }

  return reply.status(200).send({
    manna: manna.balance,
  });
}

interface RedeemMannaVoucherRequest extends FastifyRequest {
  body: {
    mannaVoucherId: string;
  }
}

export const redeemMannaVoucher = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;
  const {mannaVoucherId} = request.body as RedeemMannaVoucherRequest["body"];

  const user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: `User ${userId} not found`,
    });
  }

  let mannaVoucher = await MannaVoucher.findOne({
    code: mannaVoucherId
  });

  if (!mannaVoucher) {
    return reply.status(400).send({
      message: `Manna voucher ${mannaVoucherId} not found`,
    });
  }

  if (mannaVoucher.used) {
    return reply.status(400).send({
      message: `Manna voucher ${mannaVoucherId} already used`,
    });
  }

  const manna = await Manna.findOne({
    user: user._id,
  });

  let newBalance;
  let mannaId;

  if (!manna) {
    const newManna = new Manna({
      user: user._id,
      balance: mannaVoucher.balance,
    });
    newBalance = newManna.balance;
    mannaId = newManna._id;
    await newManna.save();
  }
  else {
    manna.balance += mannaVoucher.balance;
    newBalance = manna.balance;
    mannaId = manna._id;
    await manna.save();
  }

  const transaction = new Transaction({
    manna: mannaId,
    amount: mannaVoucher.balance,
  })
  await transaction.save();

  mannaVoucher.used = true;
  mannaVoucher.redeemedBy = user._id;
  mannaVoucher.save();

  return reply.status(200).send({
    balance: newBalance,
    transactionId: transaction._id
  });  
}
