import authRoutes from '@/routes/authRoutes';
import creditsRoutes from '@/routes/creditsRoutes';
import fastify from 'fastify';
import config from '@/plugins/config';
import fastifyJWT from '@fastify/jwt';
import mongo from '@/plugins/mongo';

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
await server.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err)
  }
});
await server.register(mongo)
await server.register(config);
await server.register(authRoutes);
await server.register(creditsRoutes);
await server.ready();

export default server;
