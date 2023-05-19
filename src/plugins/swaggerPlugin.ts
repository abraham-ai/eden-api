import type { FastifyInstance } from 'fastify';

export const registerOpenApi = async (fastify: FastifyInstance) => {
  try {
    await fastify.register(import('@fastify/swagger'), {
        openapi: {
          info: {
            title: 'Test swagger',
            description: 'testing the fastify swagger api',
            version: '0.1.0'
          },
        },
    });
    fastify.log.info('Successfully registered SwaggerPlugin');
  } catch (err) {
    fastify.log.error('Plugin: Swagger, error on register', err);
  }
};

export const registerSwaggerUi = async (fastify: FastifyInstance) => {
  try {
    await fastify.register(import('@fastify/swagger-ui'), {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClone: true
    })
    fastify.log.info('Successfully registered Swagger UI Plugin');
  } catch (err) {
    fastify.log.error('Plugin: Swagger, error on register', err);
  }
}