import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export type PraiseBurnAction = -1 | 1;

export interface PraiseBurnSchema {
  user: ObjectId;
  action: PraiseBurnAction;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface PraiseBurnDocument extends PraiseBurnSchema, Document {}

const praiseburn = new Schema<PraiseBurnDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  action: {
    type: Number,
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

praiseburn.pre<PraiseBurnDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const PraiseBurn = model<PraiseBurnDocument>('praiseburn', praiseburn);
