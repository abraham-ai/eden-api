import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface CollectionEventSchema {
  user: ObjectId;
  creation: ObjectId;
  collectionId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface CollectionEventDocument extends CollectionEventSchema, Document {}

const collectionEvent = new Schema<CollectionEventDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  creation: {
    type: Schema.Types.ObjectId,
    ref: 'creations',
    required: true,
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    ref: 'collections',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

collectionEvent.pre<CollectionEventDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const CollectionEvent = model<CollectionEventDocument>('collectionEvent', collectionEvent);
