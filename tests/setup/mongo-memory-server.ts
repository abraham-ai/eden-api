import { MongoClient } from "mongodb";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { setup, teardown } from "vitest-mongodb";

import { ApiKey, ApiKeyInput, ApiKeySchema } from "../../src/models/ApiKey";
import { User, UserInput, UserSchema } from "../../src/models/User";
import { Generator, GeneratorSchema } from "../../src/models/Generator";
import mongoose from "mongoose";

const createAdmin = async () => {
  const userData: UserInput = {
    userId: "admin",
    username: "admin",
    isWallet: false,
    isAdmin: true,
  };
  const user = new User(userData);
  await user.save();

  const apiKeyData: ApiKeyInput = {
    apiKey: "admin",
    apiSecret: "admin",
    user: user._id,
  }
  const apiKey = new ApiKey(apiKeyData);
  await apiKey.save();
}

const createUser = async () => {
  const userData: UserInput = {
    userId: "user",
    username: "user",
    isWallet: false,
    isAdmin: false,
  };
  const user = new User(userData);
  await user.save();

  const apiKeyData: ApiKeyInput = {
    apiKey: "user",
    apiSecret: "user",
    user: user._id,
  }
  const apiKey = new ApiKey(apiKeyData);
  await apiKey.save();
}

// const createGenerator = async () => {
//   const generatorVersionData = {
//     versionId: "1.0.0",
//     parameters: [
//       {
//         name: "x",
//         default: 1
//       }
//     ],
//     isDeprecated: false,
//     createdAt: new Date(),
//   }
//   const generator: GeneratorSchema = {
//     generatorName: "test",
//     versions: [generatorVersionData],
//   };
//   await Generator.create(generator);
// }

// const createReplicateGenerator = async (db: Db) => {
//   const generator: GeneratorSchema = {
//     generatorName: "abraham-ai/eden-stable-diffusion",
//     versions: [
//       {
//         versionId: "latest",
//         defaultConfig: StableDiffusionDefaults,
//         isDeprecated: false,
//         createdAt: new Date(),
//       },
//     ],
//   };
//   await db.collection("generators").insertOne(generator);
// }

beforeAll(async () => {
  await setup();
  process.env.MONGO_URI = globalThis.__MONGO_URI__;
  const client = new MongoClient(globalThis.__MONGO_URI__);
  client.db("eden");
  mongoose.set('strictQuery', true);
  mongoose.connect(process.env.MONGO_URI as string);
  // await createGenerator();

  // const replicateDb = client.db("replicate");
  // await createAdmin(replicateDb);
  // await createUser(replicateDb);
  // await createReplicateGenerator(replicateDb);
});

beforeEach(async () => {
  await createAdmin();
  await createUser();
});


afterEach(async () => {
  // delete all existing data
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // delete all existing data
  await teardown();
});