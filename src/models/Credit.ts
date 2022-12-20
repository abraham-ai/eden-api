import { Document, Schema, model } from 'mongoose';

export interface CreditSchema {
  userId: string;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface CreditDocument extends CreditSchema, Document {}

const credits = new Schema<CreditDocument>({
  userId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
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

credits.pre<CreditDocument>('update', function(next) {
    this['updatedAt'] = Date.now();

    next();
});

export const Credit = model<CreditDocument>('credits', credits);
