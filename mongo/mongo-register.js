import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { 
  createParameters,
  interpolationParameters,
  real2realParameters,
  remixParameters,
  interrogateParameters
} from './generator-params.js';

const versionId = process.argv[2];
if (!versionId) {
  throw new Error('versionId argument is missing');
}

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is missing');
}

console.log(`Updating generators for ${versionId}`);

async function updateVersion(db) {

  const createGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-pipelines',
    versionId: versionId,
    mode: 'generate',
    parameters: createParameters,
    isDeprecated: false,
  }

  const createGenerator = {
    generatorName: 'create',
    description: 'Create an image from a prompt',
    output: 'creation',
    versions: [createGeneratorVersion],
  }

  const interpolateGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-pipelines',
    versionId: versionId,
    mode: 'interpolate',
    parameters: interpolationParameters,
    isDeprecated: false,
  }

  const interpolateGenerator = {
    generatorName: 'interpolate',
    description: 'Create a video interpolation between two prompts',
    output: 'creation',
    versions: [interpolateGeneratorVersion],
  }

  const real2realGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-pipelines',
    versionId: versionId,
    mode: 'real2real',
    parameters: real2realParameters,
    isDeprecated: false
  }

  const real2realGenerator = {
    generatorName: 'real2real',
    description: 'Create a video interpolation between two images',
    output: 'creation',
    versions: [real2realGeneratorVersion]
  }

  const remixGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-pipelines',
    versionId: versionId,
    mode: 'remix',
    parameters: remixParameters,
    isDeprecated: false
  }

  const remixGenerator = {
    generatorName: 'remix',
    description: 'Generate a remix of an image',
    output: 'creation',
    versions: [remixGeneratorVersion]
  }

  const interrogateGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-pipelines',
    versionId: versionId,
    mode: 'interrogate',
    parameters: interrogateParameters,
    isDeprecated: false
  }

  const interrogateGenerator = {
    generatorName: 'interrogate',
    description: 'Generate a prompt from an image',
    output: 'creation',
    versions: [interrogateGeneratorVersion]
  }
  
  // await db.collection('generators').updateOne(
  //   { generatorName: 'create' }, 
  //   { $push: { versions: createGeneratorVersion } }
  // );

  await db.collection('generators').updateOne(
    { generatorName: 'interpolate' }, 
    { $push: { versions: interpolateGeneratorVersion } }
  );

  await db.collection('generators').updateOne(
    { generatorName: 'remix' }, 
    { $push: { versions: remixGeneratorVersion } }
  );

  await db.collection('generators').updateOne(
    { generatorName: 'real2real' }, 
    { $push: { versions: real2realGeneratorVersion } }
  );

  await db.collection('generators').updateOne(
    { generatorName: 'interrogate' }, 
    { $push: { versions: interrogateGeneratorVersion } }
  );

  console.log(`Updated generators for ${versionId}`);
}


async function main() {
  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = await client.db('eden-stg');
    await updateVersion(db);
  } catch (err) {
    console.error('Failed to connect to the server:', err);
    throw err;
  } finally {
    client.close();
  }
}

main().catch(err => {
  console.error('An unhandled error occurred:', err);
  process.exit(1);
});
