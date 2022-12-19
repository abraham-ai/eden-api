import { ApiKeySchema } from "@/models/ApiKey";
import { UserSchema } from "@/models/User";
import { MongoClient } from "mongodb";
import { beforeAll, afterAll } from "vitest";
import { setup, teardown } from "vitest-mongodb";

const createAdmin = async (client: MongoClient) => {
  const db = client.db("eden");
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

const createUser = async (client: MongoClient) => {
  const db = client.db("eden");
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

beforeAll(async () => {
  await setup();
  process.env.MONGO_URI = globalThis.__MONGO_URI__;
  console.log("MONGO_URI", process.env.MONGO_URI);
  const client = new MongoClient(globalThis.__MONGO_URI__);
  await createAdmin(client);
  await createUser(client);
});

afterAll(async () => {
  await teardown();
});