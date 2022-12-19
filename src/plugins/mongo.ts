import type { FastifyInstance } from 'fastify';

export const registerMongo = async (fastify: FastifyInstance, mongoUri: string | undefined) => {
  const url = mongoUri || process.env.MONGO_URI;
  console.log(url)
  try {
    await fastify.register(import('@fastify/mongodb'), {
      forceClose: true,
      url
    });
    fastify.log.info('Successfully registered MongoPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Mongo, error on register', err);
  }
};

export default registerMongo