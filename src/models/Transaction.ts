import { Document, Schema, model } from 'mongoose';
import { TaskDocument } from './Task';
import { MannaDocument } from './Manna';

export interface TransactionSchema {
  manna: MannaDocument;
  task?: TaskDocument;
  amount: number;
  createdAt?: Date;
}

export interface TransactionDocument extends TransactionSchema, Document {}

const transaction = new Schema<TransactionDocument>({
  manna: {
    type: Schema.Types.ObjectId,
    ref: 'manna',
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
