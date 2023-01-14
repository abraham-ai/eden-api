import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

export const registerMongo = async (fastify: FastifyInstance, mongoUri: string | undefined) => {
  const url = mongoUri || fastify.config.MONGO_URI
  try {
    await fastify.register(import('@fastify/mongodb'), {
      forceClose: true,
      url
    });
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGO_URI as string);
    fastify.log.info('Successfully registered MongoPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Mongo, error on register', err);
  }
};

export default registerMongo