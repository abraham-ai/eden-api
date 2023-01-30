import { Credit } from "../models/Credit";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { FastifyRequest, FastifyReply } from "fastify";


interface ModifyCreditsRequest extends FastifyRequest {
  body: {
    userId: string;
    amount: number;
  }
}

export const modifyCredits = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId, amount } = request.body as ModifyCreditsRequest["body"];

  if (!userId || !amount) {
    return reply.status(400).send({
      message: "Missing userId, amount, or type",
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

  const credits = await Credit.findOne({
    user: user._id,
  });
  let newCredits;

  if (!credits) {
    newCredits = new Credit({
      user: user._id,
      balance: amount,
    });
    await newCredits.save();
  } else {
    credits.balance += amount;
    await credits.save();
    newCredits = credits;
  }

  // add transaction log
  const transaction = new Transaction({
    credit: newCredits._id,
    amount,
  })
  await transaction.save();

  return reply.status(200).send({
    userId,
    balance: newCredits.balance,
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

  const credits = await Credit.findOne({
    user: user._id,
  });

  if (!credits) {
    return reply.status(200).send({
      balance: 0,
    });
  }

  return reply.status(200).send({
    balance: credits.balance,
  });
}