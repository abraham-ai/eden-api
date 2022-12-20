import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";

interface AddCreditsRequest extends FastifyRequest {
  body: {
    userId: string;
    amount: number;
  }
}

export const addCredits = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId, amount } = request.body as AddCreditsRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  if (!userId || !amount) {
    return reply.status(400).send({
      message: "Missing userId, amount, or type",
    });
  }

  const user = await server.mongo.db.collection("users").findOne({
    userId,
  });

  if (!user) {
    return reply.status(400).send({
      message: "Invalid userId",
    });
  }

  const credits = await server.mongo.db.collection("credits").findOne({
    userId,
  });

  if (!credits) {
    await server.mongo.db.collection("credits").insertOne({
      userId,
    });
  }

  await server.mongo.db.collection("credits").updateOne({
    userId,
  }, {
    $inc: {
      balance: amount,
    },
  });

  const balance = credits ? credits.balance + amount : amount;

  // add transaction log
  const dbResponse = await server.mongo.db.collection("transactions").insertOne({
    userId,
    amount,
  });
  const transactionId = dbResponse.insertedId;

  return reply.status(200).send({
    userId,
    balance,
    transactionId
  });
};

export const getBalance = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  const credits = await server.mongo.db.collection("credits").findOne({
    userId,
  });

  if (!credits) {
    return reply.status(200).send({
      balance: 0,
    });
  }

  return reply.status(200).send({
    balance: credits.manna,
  });
}