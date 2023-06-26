import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { loraParameters } from './generator-params.js';

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

  const loraGeneratorVersion = {
    provider: 'replicate',
    address: 'abraham-ai/eden-sd-lora',
    versionId: versionId,
    mode: 'lora',
    parameters: loraParameters,
    isDeprecated: false
  }

  await db.collection('generators').updateOne(
    { generatorName: 'lora' }, 
    { $push: { versions: loraGeneratorVersion } }
  );

  console.log(`Updated Lora generator for ${versionId}`);
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

