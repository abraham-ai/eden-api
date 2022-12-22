import adminRoutes from '@/routes/adminRoutes';
import authRoutes from '@/routes/authRoutes';
import creditsRoutes from '@/routes/creditsRoutes';
import apiKeyRoutes from '@/routes/apiKeyRoutes';
import generatorRoutes from '@/routes/generatorRoutes';
import taskRoutes from '@/routes/taskRoutes';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import config from '@/plugins/config';
import fastifyJWT from '@fastify/jwt';
import registerMongo from '@/plugins/mongo';
import { registerTaskHandlers, TaskHandlers } from '@/plugins/tasks';
import registerReplicate from '@/plugins/replicate';
import { routes } from '@/routes';

export interface CreateServerOpts {
  mongoUri?: string;
  taskHandlers?: TaskHandlers
}

const createServer = async (opts: CreateServerOpts = {}) => {
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
  routes.map(async route => {
    await server.register(route);
  });
  await server.ready();
  return server
}

export default createServer;