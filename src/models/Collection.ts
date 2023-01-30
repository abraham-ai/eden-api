import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface CollectionSchema {
  user: ObjectId;
  name: string;
  creations: ObjectId[];
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface CollectionDocument extends CollectionSchema, Document {}

const collection = new Schema<CollectionDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  creations: [{
    type: Schema.Types.ObjectId,
    ref: 'creations'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

collection.pre<CollectionDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Collection = model<CollectionDocument>('collection', collection);
