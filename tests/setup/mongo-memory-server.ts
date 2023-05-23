import { MongoClient } from "mongodb";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { setup, teardown } from "vitest-mongodb";

import { ApiKey, ApiKeyInput } from "@/models/ApiKey";
import { UserInput, User } from "@/models/Creator";
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

  // const replicateDb = client.db("replicate");
  // await createAdmin(replicateDb);
  // await createUser(replicateDb);
  // await createReplicateGenerator(replicateDb);
});

beforeEach(async () => {
  await createAdmin();
  await createUser();
  // await createGenerator('test');
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