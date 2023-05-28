import { FastifyRequest, FastifyReply } from "fastify";
import ethers from "ethers";
import { generateNonce } from 'siwe'

import { User, UserInput } from "../models/Creator";
import { Manna } from "../models/Manna";
import { AuthChallengeRequestBody, AuthLoginRequestBody } from "../routes/authRoutes";
import Challenge from "../models/Challenge";


export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { address, signature, message } = request.body as AuthLoginRequestBody;

  // first, verify we have created a challenge for this address by recovering the nonce
  const challenge = await Challenge.findOne({
    address: address,
  });

  if (!challenge) {
    return reply.status(400).send({
      message: "No challenge found for this address",
    });
  }

  // Verify the challenge has not expired
  if (challenge.expiresAt < new Date()) {
    return reply.status(400).send({
      message: "Challenge has expired",
    });
  }

  // Verify the challenge has not been acknowledged
  if (challenge.ack) {
    return reply.status(400).send({
      message: "Challenge has already been used",
    });
  }

  // verify the signature
  const recovered = ethers.utils.verifyMessage(message, signature);

  if (address.toLowerCase() !== recovered.toLowerCase()) {
    return reply.status(400).send({
      message: "Signature is invalid",
    });
  }

  let authUser = await User.findOne({
    userId: address,
  });

  // create a new user if none found
  if (!authUser) {
    const userInput: UserInput = {
      userId: address,
      username: address,
      isWallet: true,
    };
    const newUser = new User(userInput);
    await newUser.save();
    authUser = newUser;

    // Give them free Manna
    const newManna = new Manna({
      user: authUser._id,
      balance: 1000,
    });
    await newManna.save();
  }

  const token = await reply.jwtSign({
    userId: authUser._id,
    isAdmin: false,
  });

  // mark the challenge as acknowledged
  challenge.ack = true;
  await challenge.save();

  return reply.status(200).send({
    token: token,
  });
};

export const createChallenge = async (request: FastifyRequest, reply: FastifyReply) => {
  const { address } = request.body as AuthChallengeRequestBody;

  const nonce = generateNonce();

  await Challenge.create({
    address: address,
    nonce: nonce,
  });

  return reply.status(200).send({
    nonce,
  });
}