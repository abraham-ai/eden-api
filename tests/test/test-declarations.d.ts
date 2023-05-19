import { FastifyInstance } from "fastify";

declare module 'vitest' {
  export interface TestContext {
    server: FastifyInstance
    replicateServer: FastifyInstance
  }
}