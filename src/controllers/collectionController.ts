import assert from 'assert';
import { Collection, CollectionDocument } from "../models/Collection";
import { CollectionEvent } from "../models/CollectionEvent";
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
      message: `Collection ${collectionId} not found`
    });
  }

  return reply.status(200).send({collection});
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
  
  return reply.status(200).send({collections});
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

  return reply.status(200).send({collection});
};

export const getCollectionCreations = async (request: FastifyRequest, reply: FastifyReply) => {
  const { collectionId } = request.params as GetCollectionParams;

  let creations: CreationDocument | null = null;

  try {
    creations = await CollectionEvent.findById(collectionId).populate({
      path: 'creation',
      select: 'user parent uri attributes createdAt',
    });
  }
  catch (error) {
    return reply.status(404).send({
      message: `Collection ${collectionId} not found`
    });
  }

  return reply.status(200).send({creations});
};

interface UpdateCollectionRequest {
  body: {
    creationId: string;
  }
}

export const addToCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { collectionId } = request.params as GetCollectionParams;
  const { creationId } = request.body as UpdateCollectionRequest["body"];

  let collection: CollectionDocument | null = null;
  let creation: CreationDocument | null = null;

  try {
    collection = await Collection.findById(collectionId);
    assert(collection);
  } catch (error) {
    return reply.status(404).send({
      message: `Collection ${collectionId} not found`
    });
  }

  creation = await Creation.findById(creationId);

  if (creation === null) {
    return reply.status(400).send({
      message: `Creation ${creationId} not found`
    });
  }

  if (userId.toString() !== collection.user.toString()) {
    return reply.status(403).send({
      message: 'You are not authorized to update this collection'
    });
  }

  const collectionEventData = {
    user: userId,
    creation: creation,
    collectionId: collection,
  }

  const collectionEvent = await CollectionEvent.findOne(collectionEventData);
  if (collectionEvent) {
    return reply.status(200).send({
      success: true
    });
  }

  try {         
    const newCollectionEvent = new CollectionEvent(collectionEventData);
    await newCollectionEvent.save();
    return reply.status(200).send({
      success: true,
    });  
  } catch (error) {
    return reply.status(404).send({
      message: 'CollectionEvent not found'
    });
  }

};

export const removeFromCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { collectionId } = request.params as GetCollectionParams;
  const { creationId } = request.body as UpdateCollectionRequest["body"];

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

  creation = await Creation.findById(creationId);

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

  const collectionEventData = {
    user: userId,
    creation: creation,
    collectionId: collection,
  }

  const collectionEvent = await CollectionEvent.findOne(collectionEventData);
  if (collectionEvent == null) {
    return reply.status(403).send({
      message: 'Creation not in collection'
    });
  }

  try {    
    await collectionEvent.delete();
    return reply.status(200).send({
      success: true,
    });  
  } catch (error) {
    return reply.status(404).send({
      message: 'Creation not found'
    });
  }

};


export const deleteCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { collectionId } = request.params as GetCollectionParams;

  let collection: CollectionDocument | null = null;

  try {
    collection = await Collection.findById(collectionId);
    assert(collection);
  } catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }

  if (userId.toString() !== collection.user.toString()) {
    return reply.status(403).send({
      message: 'You are not authorized to delete this collection'
    });
  }

  try {
    await Collection.deleteOne({ _id: collectionId });
    return reply.status(200).send({
      success: true,
    });  
  }
  catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }
};

interface RenameCollectionRequest {
  body: {
    name: string;
  }
}

export const renameCollection = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.user;
  const { collectionId } = request.params as GetCollectionParams;
  const { name } = request.body as RenameCollectionRequest["body"];

  let collection: CollectionDocument | null = null;

  try {
    collection = await Collection.findById(collectionId);
    assert(collection);
  } catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }

  if (userId.toString() !== collection.user.toString()) {
    return reply.status(403).send({
      message: 'You are not authorized to rename this collection'
    });
  }

  try {
    await Collection.findOneAndUpdate({_id: collectionId}, { name });
    return reply.status(200).send({
      success: true,
    });
  }
  catch (error) {
    return reply.status(404).send({
      message: 'Collection not found'
    });
  }
};

