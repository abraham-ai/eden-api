import { MongoClient } from "mongodb";
import { beforeAll, afterAll } from "vitest";
import { setup, teardown } from "vitest-mongodb";

import { ApiKey, ApiKeySchema } from "../../src/models/ApiKey";
import { User, UserSchema } from "../../src/models/User";
import { Generator, GeneratorSchema } from "../../src/models/Generator";
import mongoose from "mongoose";

const createAdmin = async () => {
  const adminUser: UserSchema = {
    userId: "admin",
    username: "admin",
    isWallet: false,
    isAdmin: true,
  };
  const user = new User(adminUser);
  await user.save();

  const adminApiKey: ApiKeySchema = {
    apiKey: "admin",
    apiSecret: "admin",
    deleted: false,
    user: user._id,
  }
  const apiKey = new ApiKey(adminApiKey);
  await apiKey.save();
}

const createUser = async () => {
  const userData: UserSchema = {
    userId: "user",
    username: "user",
    isWallet: false,
    isAdmin: false,
  };
  const user = new User(userData);
  await user.save();

  const apiKeyData: ApiKeySchema = {
    apiKey: "user",
    apiSecret: "user",
    deleted: false,
    user: user._id,
  }
  const apiKey = new ApiKey(apiKeyData);
  await apiKey.save();
}

const createGenerator = async () => {
  const generatorVersionData = {
    versionId: "1.0.0",
    parameters: [
      {
        name: "x",
        default: 1
      }
    ],
    isDeprecated: false,
    createdAt: new Date(),
  }
  const generator: GeneratorSchema = {
    generatorName: "test",
    versions: [generatorVersionData],
  };
  await Generator.create(generator);
}

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
  const db = client.db("eden");
  mongoose.set('strictQuery', true);
  mongoose.connect(process.env.MONGO_URI as string);
  await createAdmin();
  await createUser();
  await createGenerator();

  // const replicateDb = client.db("replicate");
  // await createAdmin(replicateDb);
  // await createUser(replicateDb);
  // await createReplicateGenerator(replicateDb);
});

afterAll(async () => {
  await teardown();
});