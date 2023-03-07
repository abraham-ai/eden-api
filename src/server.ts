import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJWT from '@fastify/jwt';

import config from './plugins/config';
import registerMongo from './plugins/mongoPlugin';
import registerMinio from './plugins/minioPlugin';
import registerMultipart from './plugins/multipartPlugin';
import { registerTaskHandlers, TaskHandlers } from './plugins/tasks';
import registerReplicate from './plugins/replicatePlugin';
import registerLlm from './plugins/llmPlugin';
import registerTts from './plugins/ttsPlugin';
import { routes } from './routes';
import { taskHandlers } from './lib/taskHandlers/taskHandler';

export interface CreateServerOpts {
  mongoUri?: string;
  taskHandlers?: TaskHandlers
}

const createServer = async (opts: CreateServerOpts = {
  taskHandlers: taskHandlers
}) => {
  const server = fastify({
    ajv: {
      customOptions: {
        removeAdditional: "all",
        coerceTypes: true,
        useDefaults: true,
      }
    },
    logger: {
      level: process.env.LOG_LEVEL,
    },
  });

  await server.register(config);
  await registerMongo(server, opts.mongoUri);
  await registerMultipart(server);
  await registerTaskHandlers(server, opts.taskHandlers);

  await server.register(fastifyJWT, {
    secret: server.config.JWT_SECRET
  });

  await server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err)
    }
  });

  if (server.config.REPLICATE_API_TOKEN) {
    await registerReplicate(server);
  }

  if (server.config.OPENAI_API_KEY) {
    await registerLlm(server);
  }

  if (server.config.PLAYHT_API_KEY) {
    await registerTts(server);
  }

  if (server.config.MINIO_URL) {
    await registerMinio(server);
  }

  await server.register(import('@fastify/rate-limit'), {
    max: 1000,
    timeWindow: '1 minute',
  })

  routes.map(async route => {
    await server.register(route);
  });
  await server.ready();
  return server;
}

export default createServer;