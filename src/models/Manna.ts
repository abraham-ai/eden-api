import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface MannaSchema {
  user: UserDocument
  balance: number;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface MannaDocument extends MannaSchema, Document {}

const manna = new Schema<MannaDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
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

manna.pre<MannaDocument>('update', function(next) {
    this['updatedAt'] = Date.now();

    next();
});

export const Manna = model<MannaDocument>('manna', manna);
