import { User } from "../models/User";
import ethers from "ethers";
import { FastifyRequest, FastifyReply } from "fastify";
import { Manna } from "../models/Manna";


interface LoginRequest extends FastifyRequest {
  body: {
    address: string;
    message: string;
    signature: string;
  }
}

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { body: { address, signature, message } } = request as LoginRequest;

    if (!address || !signature || !message) {
      return reply.status(400).send({
        message: "Missing address, signature or message",
      });
    }
    const recovered = ethers.utils.verifyMessage(message, signature);

    if (address.toLowerCase() !== recovered.toLowerCase()) {
      return reply.status(400).send({
        message: "Signature is invalid",
      });
    }

    let authUser = await User.findOne({
      userId: address,
    });

    if (!authUser) {
      // Create a new user
      const newUser = new User({
        userId: address,
        username: address,
        isWallet: true,
      });
      await newUser.save();
      authUser = newUser;

      // Create a new credit
      const newManna = new Manna({
        user: authUser._id,
        balance: 100,
      });
      await newManna.save();
    }

    const token = await reply.jwtSign({
      userId: authUser._id,
      isAdmin: false,
    });

    return reply.status(200).send({
      token,
    });
};

