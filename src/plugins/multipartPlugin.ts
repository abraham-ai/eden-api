import type { FastifyInstance } from 'fastify';

export const registerMultipart = async (fastify: FastifyInstance) => {
  try {
    fastify.register(import('@fastify/multipart'), {
      limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100,     // Max field value size in bytes
        fields: 10,         // Max number of non-file fields
        fileSize: 10000000,  // For multipart forms, the max file size in bytes
        files: 1,           // Max number of file fields
        headerPairs: 2000   // Max number of header key=>value pairs
      }
    });
    fastify.log.info('Successfully registered Multipart Plugin');
  } catch (err) {
    fastify.log.error(err);
    fastify.log.error('Plugin: Multipart, error on register', err);
  }
};
  
export default registerMultipart
