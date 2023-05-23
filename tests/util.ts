import { User } from '@/models/User'
import createServer, { CreateServerOpts } from '@/server'
import { FastifyInstance } from 'fastify'
import { ObjectId } from 'mongodb'
import { Character, CharacterInput } from '../src/models/Character'
import { Lora, LoraInput } from '../src/models/Lora'
import { LiveMint, LiveMintSchema } from '../src/models/LiveMint'
import { Generator, GeneratorSchema } from '../src/models/Generator'

export const createTestServer = async () => {
  const opts: CreateServerOpts = {
    mongoUri: globalThis.__MONGO_URI__ + 'eden',
  }
  const server = await createServer(opts)
  return server;
}

// export const createReplicateServer = async () => {
//   const opts: CreateServerOpts = {
//     mongoUri: globalThis.__MONGO_URI__ + 'replicate',
//     taskHandlers: replicateTaskHandlers
//   }
//   const server = await createServer(opts)
//   return server;
// }

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

export const createCharacter = async () => {
  const userId = await getDefaultUserId();
  const characterInput: CharacterInput = {
    user: userId,
    task: getDummyObjectId(),
    name: 'Test Character',
    checkpoint: 'checkpoint',
    training_images: [],
    uri: 'uri',
  }
  const character = await Character.create(characterInput);
  return character;
}

export const createLora = async () => {
  const userId = await getDefaultUserId();
  const loraInput: LoraInput = {
    user: userId,
    task: getDummyObjectId(),
    name: 'Test Character',
    checkpoint: 'checkpoint',
    training_images: [],
    uri: 'uri',
  }
  const lora = await Lora.create(loraInput);
  return lora;
}

export const createMint = async () => {
  const mintInput: LiveMintSchema = {
    mintId: 'mintId',
    block: 0,
    txHash: 'txHash',
    caller: 'user',
    tokenId: 0,
    ack: true,
    taskId: 'taskId',
    edenSuccess: true,
    imageUri: 'imageUri',
    ipfsUri: 'ipfsUri',
    ipfsImageUri: 'ipfsImageUri',
    txSuccess: true,
  }
  const mint = await LiveMint.create(mintInput);
  return mint;
}

