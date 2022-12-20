import createServer, { CreateServerOpts } from '@/server'
import { FastifyInstance } from 'fastify'

export const createTestServer = async () => {
  const opts: CreateServerOpts = {
    mongoUri: globalThis.__MONGO_URI__ + 'eden',
  }
  const server = await createServer(opts)
  return server
}

export const loginAsAdmin = async (server: FastifyInstance) => {
  const payload = {
    apiKey: 'admin',
    apiSecret: 'admin',
  }
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login/api-key',
    payload
  })
  const token = response.json().token
  return token
}

export const loginAsUser = async (server: FastifyInstance) => {
  const payload = {
    apiKey: 'user',
    apiSecret: 'user',
  }
  const response = await server.inject({
    method: 'POST',
    url: '/auth/login/api-key',
    payload
  })
  const token = response.json().token
  return token
}


export const getDb = (server: FastifyInstance) => {
  const db = server.mongo.db
  if (!db) {
    throw new Error('No database connection')
  }
  return db
}