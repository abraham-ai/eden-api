import { ApiKeySchema } from "@/models/ApiKey";
import { UserSchema } from "@/models/User";
import { MongoClient } from "mongodb";
import { beforeAll, afterAll } from "vitest";
import { setup, teardown } from "vitest-mongodb";
import { Db } from "mongodb";
import { GeneratorSchema } from "@/models/Generator";

const createAdmin = async (db: Db) => {
  const adminUser: UserSchema = {
    userId: "admin",
    isWallet: false,
    isAdmin: true,
  };
  await db.collection("users").insertOne(adminUser);
  const adminApiKey: ApiKeySchema = {
    apiKey: "admin",
    apiSecret: "admin",
    userId: "admin",
  }
  await db.collection("apiKeys").insertOne(adminApiKey);
}

const createUser = async (db: Db) => {
  const user: UserSchema = {
    userId: "user",
    isWallet: false,
    isAdmin: false,
  };
  await db.collection("users").insertOne(user);
  const apiKey: ApiKeySchema = {
    apiKey: "user",
    apiSecret: "user",
    userId: "user",
  }
  await db.collection("apiKeys").insertOne(apiKey);
}

const createGenerator = async (db: Db) => {
  const generator: GeneratorSchema = {
    generatorId: "test",
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

beforeAll(async () => {
  await setup();
  process.env.MONGO_URI = globalThis.__MONGO_URI__;
  const client = new MongoClient(globalThis.__MONGO_URI__);
  const db = client.db("eden");
  await createAdmin(db);
  await createUser(db);
  await createGenerator(db);
});

afterAll(async () => {
  await teardown();
});