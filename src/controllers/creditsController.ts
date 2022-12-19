import { CreditType } from "@/models/Credit";
import { FastifyRequest, FastifyInstance, FastifyReply } from "fastify";

interface AddCreditsRequest extends FastifyRequest {
  body: {
    userId: string;
    amount: number;
    type: CreditType 
  }
}

export const addCredits = async (server: FastifyInstance, request: FastifyRequest, reply: FastifyReply) => {
  const { userId, amount, type } = request.body as AddCreditsRequest["body"];

  if (!server.mongo.db) {
    return reply.status(500).send({
      message: "Database not connected",
    });
  }

  if (!userId || !amount || !type) {
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
      credits: {}
    });
  }

  await server.mongo.db.collection("credits").updateOne({
    userId,
  }, {
    $inc: {
      [`credits.${type}`]: amount,
    },
  });

  const balance = credits ? credits.credits[type] + amount : amount;

  // add transaction log
  await server.mongo.db.collection("transactions").insertOne({
    userId,
    amount,
    type,
  });

  return reply.status(200).send({
    userId,
    balance,
    type,
  });
};