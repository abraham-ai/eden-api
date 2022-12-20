import { Document, Schema, model } from 'mongoose';

export interface TransactionSchema {
  userId: string;
  amount: number;
  createdAt?: Date;
}

export interface TransactionDocument extends TransactionSchema, Document {}

const transaction = new Schema<TransactionDocument>({
  userId: {
    type: String,
    required: true,
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
