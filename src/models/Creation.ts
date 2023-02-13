import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface CreationSchema {
  user: ObjectId;
  task: ObjectId;
  parent?: ObjectId;
  delegateUser?: ObjectId;
  delegateHasClaimed?: boolean;
  uri?: string;
  thumbnail?: string;
  attributes?: any
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface CreationDocument extends CreationSchema, Document {}

const creation = new Schema<CreationDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'tasks',
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'creations',
  },
  delegateUser: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  delegateHasClaimed: {
    type: Boolean,
    default: false,
  },
  uri: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  attributes: {
    type: Schema.Types.Mixed,
    default: {},
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

creation.pre<CreationDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Creation = model<CreationDocument>('creations', creation);
