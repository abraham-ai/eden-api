import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface CollectionSchema {
  user: UserDocument;
  name: string;
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

export const Collection = model<CollectionDocument>('collections', collection);
