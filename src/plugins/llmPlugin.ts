import type { FastifyInstance } from 'fastify';
import { Configuration, OpenAIApi } from 'openai';

export const registerLlm = async (fastify: FastifyInstance) => {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    fastify.decorate('llm', openai);
    fastify.log.info('Successfully registered LlmPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Llm, error on register', err);
  }
};

declare module "fastify" {
  interface FastifyInstance {
    llm?: OpenAIApi;
  }
}

export default registerLlm;