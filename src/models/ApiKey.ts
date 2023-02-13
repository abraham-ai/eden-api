import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface ApiKeySchema {
  user: UserDocument;
  apiKey: string;
  apiSecret: string;
  note: string,
  deleted?: boolean;
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
  note: {
    type: String,
    required: false,
  },
  deleted: {
    type: Boolean,
    default: false,
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

export const ApiKey = model<ApiKeyDocument>('apikey', apiKey);
