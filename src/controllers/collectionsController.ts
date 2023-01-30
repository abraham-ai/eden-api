import assert from 'assert';
import { Collection, CollectionDocument } from "../models/Collection";
import { Creation, CreationDocument } from "../models/Creation";
import { FastifyRequest, FastifyReply } from "fastify";


interface GetCollectionParams {
  collectionId: string;
}

export const getCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { collectionId } = request.params as GetCollectionParams;

  let collection: CollectionDocument | null = null;

  try {
    collection = await Collection.findById(collectionId);
  } 
  catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }

  return reply.status(200).send({
    collection,
  });
};

interface GetCollectionsRequest {
  query: {
    userId: string;
  }
}

export const getCollections = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.query as GetCollectionsRequest["query"];

  let collections: CollectionDocument[] = [];

  let filter = {};
  if (userId) {
    filter = {user: userId};
  }

  collections = await Collection.find(filter);
  
  return reply.status(200).send({
    collections,
  });
};

interface CreateCollectionRequest {
  body: {
    name: string;
  }
}

export const createCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { name } = request.body as CreateCollectionRequest["body"];

  if (!name) {
    return reply.status(400).send({
      message: 'Missing name',
    });
  }

  const collection = new Collection({
    user: userId,
    name,
  });

  await collection.save();

  return reply.status(200).send({
    collection,
  });
};

interface UpdateCollectionRequest {
  body: {
    collectionId: string;
    creationId: string;
    action: string;
  }
}

export const updateCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;

  const { collectionId, creationId, action } = request.body as UpdateCollectionRequest["body"];

  let collection: CollectionDocument | null = null;
  let creation: CreationDocument | null = null;

  try {
    collection = await Collection.findById(collectionId);
    assert(collection);
  } catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }

  if (creation === null) {
    return reply.status(400).send({
      message: 'Missing creationId'
    });
  }
  
  if (userId.toString() !== collection.user.toString()) {
    return reply.status(403).send({
      message: 'You are not authorized to update this collection'
    });
  }

  try {
    creation = await Creation.findById(creationId);
    assert(creation);
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }
  
  if (action === 'add') {
    if (collection.creations.includes(creation._id)) {
      return reply.status(400).send({
        message: 'Creation already in collection'
      });
    }
    collection.creations.push(creation._id);
  } 
  else if (action === 'remove') {
    if (creation) {
      collection.creations = collection.creations.filter(c => c.toString() !== creation!._id.toString());
    } 
    else {
      return reply.status(400).send({
        message: 'Creation not in collection'
      });
    }
  } else {
    return reply.status(400).send({
      message: 'Invalid action, only "add" or "remove" are allowed'
    });
  }
  
  try {
    await collection.save();
    return reply.status(200).send({
      collection: collection
    });
  } 
  catch (error) {
    return reply.status(500).send({
      message: 'Error updating collection'
    });
  }

};
