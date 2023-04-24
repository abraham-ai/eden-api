import assert from 'assert';
import { LiveMint, LiveMintDocument } from "../models/LiveMint";
import { FastifyRequest, FastifyReply } from "fastify";


interface GetMintParams {
  mintId: string;
}

export const getMint = async (request: FastifyRequest, reply: FastifyReply) => {
  const { mintId } = request.params as GetMintParams;

  let livemint: LiveMintDocument | null = null;

  try {
    livemint = await LiveMint.findById(mintId);
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Mint not found'
    });
  }

  return reply.status(200).send({
    livemint,
  });
};

interface GetMintsRequest {
  query: {
    userId: string;
  }
}

export const getMints = async (request: FastifyRequest, reply: FastifyReply) => {
  console.log("lets go")
  const { userId } = request.query as GetMintsRequest["query"];
console.log("get mints??")
  let mints: LiveMintDocument[] = [];

  // let filter = {};
  // if (userId) {
  //   filter = {user: userId};
  // }

  mints = await LiveMint.find({});
  
  return reply.status(200).send({
    mints,
  });
};
