import { ObjectId } from 'mongodb'
import { replicateTaskHandlers } from '../src/lib/taskHandlers/replicate'
import { User } from '../src/models/Creator'
import { GeneratorSchema, Generator } from '../src/models/Generator'
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

export const getDefaultUserId = async () => {
  const userResult = await User.findOne({ userId: 'user' })
  return userResult?._id
}

export const getDummyObjectId = () => {
  return new ObjectId(0);
}

export const createGenerator = async (generatorName: string) => {
  const generatorVersionData = {
    versionId: "1.0.0",
    parameters: [
      {
        name: "x",
        label: "x",
        description: "x",
        default: 1,
      }
    ],
    isDeprecated: false,
    provider: "test",
    mode: "test",
    address: "test",
    creationAttributes: [],
    createdAt: new Date(),
  }
  const generator: GeneratorSchema = {
    generatorName,
    description: "test",
    versions: [generatorVersionData],
    output: "creation"
  };
  await Generator.create(generator);
  return generator;
}