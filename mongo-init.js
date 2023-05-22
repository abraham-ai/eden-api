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

const admin = db.users.insertMany([
 {
    userId: 'admin',
    username: 'admin',
    isWallet: false,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 'user',
    username: 'user',
    isWallet: false,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]);

db.createCollection('apikeys');

db.apikeys.insertMany([
  {
    user: admin.insertedIds[0],
    apiKey: 'admin',
    apiSecret: 'admin',
    note: 'Admin API key',
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    user: admin.insertedIds[1],
    apiKey: 'user',
    apiSecret: 'user',
    note: 'User API key',
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
]);

db.createCollection('characters');

db.characters.insertOne({
  user: admin.insertedIds[1],
  task: admin.insertedIds[1],
  name: 'Test Character',
  checkpoint: 'checkpoint',
  training_images: [],
  uri: 'uri',
});

db.createCollection('loras');

db.loras.insertOne({
  user: admin.insertedIds[1],
  task: admin.insertedIds[1],
  name: 'Test Character',
  checkpoint: 'checkpoint',
  training_images: [],
  uri: 'uri',
});

db.createCollection('livemints');

db.livemints.insertOne({
  mintId: 'mintId',
  block: 0,
  txHash: 'txHash',
  caller: 'user',
  tokenId: 0,
  ack: true,
  taskId: 'taskId',
  edenSuccess: true,
  imageUri: 'imageUri',
  ipfsUri: 'ipfsUri',
  ipfsImageUri: 'ipfsImageUri',
  txSuccess: true,
});