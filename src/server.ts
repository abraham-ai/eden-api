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

  await server.register(fastifyJWT, {
    secret: process.env.JWT_SECRET as string,
  });
  await server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err)
    }
  });
  await registerMongo(server, opts.mongoUri);
  await registerTaskHandlers(server, opts.taskHandlers);
  await server.register(config);
  await server.register(adminRoutes);
  await server.register(authRoutes);
  await server.register(creditsRoutes);
  await server.register(apiKeyRoutes);
  await server.register(generatorRoutes);
  await server.register(taskRoutes);
  await server.ready();
  return server
}

export default createServer;