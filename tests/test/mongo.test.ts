import { MongoClient } from "mongodb";
import { it, expect } from "vitest";

it("connects to mongodb", () => {
  expect(async () => {
    const client = new MongoClient(globalThis.__MONGO_URI__);
    try {
      const db = client.db("eden");
      await db.command({ ping: 1 });
    } finally {
      await client.close();
    }
  }).not.toThrow();
});

it("has an admin user", () => {
  expect(async () => {
    const client = new MongoClient(globalThis.__MONGO_URI__);
    try {
      const db = client.db("eden");
      const admin = await db.collection("users").findOne({ userId: "admin" });
      expect(admin).toBeDefined();
    } finally {
      await client.close();
    }
  }).not.toThrow();
});

it("has an admin api key", () => {
  expect(async () => {
    const client = new MongoClient(globalThis.__MONGO_URI__);
    try {
      const db = client.db("eden");
      const admin = await db.collection("apiKeys").findOne({ apiKey: "admin", apiSecret: "admin" });
      expect(admin).toBeDefined();
    } finally {
      await client.close();
    }
  }).not.toThrow();
});

it("has a non-admin user", () => {
  expect(async () => {
    const client = new MongoClient(globalThis.__MONGO_URI__);
    try {
      const db = client.db("eden");
      const user = await db.collection("users").findOne({ userId: "user" });
      expect(user).toBeDefined();
    } finally {
      await client.close();
    }
  }).not.toThrow();
});

it("has a user api key", () => {
  expect(async () => {
    const client = new MongoClient(globalThis.__MONGO_URI__);
    try {
      const db = client.db("eden");
      const user = await db.collection("apiKeys").findOne({ apiKey: "user", apiSecret: "user" });
      expect(user).toBeDefined();
    } finally {
      await client.close();
    }
  }).not.toThrow();
});