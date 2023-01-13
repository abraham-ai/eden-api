import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface TransactionSchema {
  credit: ObjectId;
  task?: ObjectId;
  amount: number;
  createdAt?: Date;
}

export interface TransactionDocument extends TransactionSchema, Document {}

const transaction = new Schema<TransactionDocument>({
  credit: {
    type: Schema.Types.ObjectId,
    ref: 'credits',
    required: true,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'tasks',
  },
  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction = model<TransactionDocument>('transactions', transaction);
