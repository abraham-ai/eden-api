import { FastifyRequest, FastifyReply } from "fastify";
import ethers from "ethers";

import { User, UserInput } from "../models/Creator";
import { Manna } from "../models/Manna";
import { AuthLoginRequestBody } from "../routes/authRoutes";


export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { address, signature, message } = request.body as AuthLoginRequestBody;

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

  return reply.status(200).send({
    token: token,
  });
};

