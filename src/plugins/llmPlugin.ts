import type { FastifyInstance } from 'fastify';

export const registerLlm = async (fastify: FastifyInstance) => {
  try {
    // const replicate = new Replicate({
    //   token: process.env.REPLICATE_TOKEN as string
    // });
    // fastify.decorate('replicate', replicate);
    fastify.log.info('Successfully registered LlmPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Replicate, error on register', err);
  }
};

declare module "fastify" {
  interface FastifyInstance {
    // replicate?: Replicate;
  }
}

export default registerLlm;