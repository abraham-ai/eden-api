import { FastifyRequest, FastifyReply } from "fastify";

import { Manna } from "../../models/Manna";
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

  const user = await User.findOne({
    userId,
  })

  if (!user) {
    return reply.status(400).send({
      message: "Invalid userId",
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

  // add transaction log
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

export const getBalance = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;

  const user = await User.findById(userId);

  if (!user) {
    return reply.status(400).send({
      message: "Invalid userId",
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