db = db.getSiblingDB('eden');

db.createUser({
  user: 'eden',
  pwd: 'eden',
  roles: [
    {
      role: 'readWrite',
      db: 'eden',
    },
  ],
});

db.createCollection('users');

db.users.insertMany([
 {
    userId: "admin",
    isWallet: false,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('apiKeys');

db.apiKeys.insertMany([
  {
    apiKey: "admin",
    apiSecret: "admin",
    userId: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);