import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface ApiKeySchema {
  user: ObjectId;
  apiKey: string;
  apiSecret: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface ApiKeyDocument extends ApiKeySchema, Document {}

const apiKey = new Schema<ApiKeyDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  apiSecret: {
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

apiKey.pre<ApiKeyDocument>('update', function(next) {
    this['updatedAt'] = Date.now();

    next();
});

export const ApiKey = model<ApiKeyDocument>('apiKeys', apiKey);
