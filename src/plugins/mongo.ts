import type { FastifyMongodbOptions } from '@fastify/mongodb';
import type { FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

type MongoConnectionPluginType = FastifyPluginAsync<FastifyMongodbOptions>;

const mongoPlugin: MongoConnectionPluginType = async (fastify) => {
  try {
    await fastify.register(import('@fastify/mongodb'), {
      forceClose: true,
      url: process.env.MONGO_URI as string,
    });
    fastify.log.info('Successfully registered MongoPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Mongo, error on register', err);
  }
};

export default fastifyPlugin(mongoPlugin);