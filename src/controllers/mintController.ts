import { LiveMint } from "../models/LiveMint";
import { FastifyRequest, FastifyReply } from "fastify";
import { MintGetQuery, MintListQuery } from "../routes/mintRoutes";
import { User } from "../models/Creator";


export const getMint = async (request: FastifyRequest, reply: FastifyReply) => {
  const { mintId } = request.query as MintGetQuery

  try {
    const mint = await LiveMint.findById(mintId);
    return reply.status(200).send({
      mint,
    });
  }
  catch (error) {
    return reply.status(404).send({
      message: 'Mint not found'
    });
  }
};

export const getMints = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as MintListQuery
  const user = await User.findOne({userId});
  if (!user) {
    return reply.status(404).send({
      message: 'User not found'
    });
  }
  const mints = await LiveMint.find({});
  return reply.status(200).send({mints});
};
