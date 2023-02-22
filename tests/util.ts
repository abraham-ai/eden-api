import { replicateTaskHandlers } from '../src/lib/taskHandlers/replicate'
import createServer, { CreateServerOpts } from '../src/server'
import { FastifyInstance } from 'fastify'

export const createTestServer = async () => {
  const opts: CreateServerOpts = {
    mongoUri: globalThis.__MONGO_URI__ + 'eden',
  }
  const server = await createServer(opts)
  return server;
}

export const createReplicateServer = async () => {
  const opts: CreateServerOpts = {
    mongoUri: globalThis.__MONGO_URI__ + 'replicate',
    taskHandlers: replicateTaskHandlers
  }
  const server = await createServer(opts)
  return server;
}

export const getDb = (server: FastifyInstance) => {
  const db = server.mongo.db
  if (!db) {
    throw new Error('No database connection')
  }
  return db;
}

export const prepareUserHeaders = () => {
  return {
    'x-api-key': 'user',
    'x-api-secret': 'user',
  }
}

export const prepareAdminHeaders = () => {
  return {
    'x-api-key': 'admin',
    'x-api-secret': 'admin'
  }
}