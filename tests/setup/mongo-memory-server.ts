import { MongoClient } from "mongodb";
import { beforeAll, afterAll } from "vitest";
import { setup, teardown } from "vitest-mongodb";
import { Db } from "mongodb";

import { ApiKeySchema } from "../../src/models/ApiKey";
import { UserSchema } from "../../src/models/User";
import { GeneratorSchema } from "../../src/models/Generator";
import { StableDiffusionDefaults } from "../../src/types/generatorTypes";

const createAdmin = async (db: Db) => {
  const adminUser: UserSchema = {
    userId: "admin",
    isWallet: false,
    isAdmin: true,
  };
  const userResult = await db.collection("users").insertOne(adminUser);

  const adminApiKey: ApiKeySchema = {
    apiKey: "admin",
    apiSecret: "admin",
    user: userResult.insertedId,
  }
  await db.collection("apiKeys").insertOne(adminApiKey);
}

const createUser = async (db: Db) => {
  const user: UserSchema = {
    userId: "user",
    isWallet: false,
    isAdmin: false,
  };
  const userResult = await db.collection("users").insertOne(user);
  const apiKey: ApiKeySchema = {
    apiKey: "user",
    apiSecret: "user",
    user: userResult.insertedId,
  }
  await db.collection("apiKeys").insertOne(apiKey);
}

const createGenerator = async (db: Db) => {
  const generator: GeneratorSchema = {
    generatorName: "test",
    versions: [
      {
        versionId: "1.0.0",
        defaultConfig: {x: 1},
        isDeprecated: false,
        createdAt: new Date(),
      },
    ],
  };
  await db.collection("generators").insertOne(generator);
}

const createReplicateGenerator = async (db: Db) => {
  const generator: GeneratorSchema = {
    generatorName: "abraham-ai/eden-stable-diffusion",
    versions: [
      {
        versionId: "latest",
        defaultConfig: StableDiffusionDefaults,
        isDeprecated: false,
        createdAt: new Date(),
      },
    ],
  };
  await db.collection("generators").insertOne(generator);
}

beforeAll(async () => {
  await setup();
  process.env.MONGO_URI = globalThis.__MONGO_URI__;
  const client = new MongoClient(globalThis.__MONGO_URI__);
  const db = client.db("eden");
  await createAdmin(db);
  await createUser(db);
  await createGenerator(db);

  const replicateDb = client.db("replicate");
  await createAdmin(replicateDb);
  await createUser(replicateDb);
  await createReplicateGenerator(replicateDb);
});

afterAll(async () => {
  await teardown();
});