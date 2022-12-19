import { Document, Schema, model } from 'mongoose';

export interface ApiKeySchema {
  apiKey: string;
  apiSecret: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface ApiKeyDocument extends ApiKeySchema, Document {}

const apiKey = new Schema<ApiKeyDocument>({
  apiKey: {
    type: String,
    required: true,
  },
  apiSecret: {
    type: String,
    required: true,
  },
  userId: {
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
