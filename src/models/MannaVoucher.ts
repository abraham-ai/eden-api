import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface MannaVoucherSchema {
  allowedUsers: UserDocument[];
  balance: number;
  used: boolean;
  code: string;
  redeemedBy: UserDocument;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface MannaVoucherDocument extends MannaVoucherSchema, Document {}

const mannavoucher = new Schema<MannaVoucherDocument>({
  allowedUsers: {
    type: [Schema.Types.ObjectId],
    ref: 'users',
    default: null,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  code: {
    type: String,
    default: null,
  },
  redeemedBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    default: null,
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

mannavoucher.pre<MannaVoucherDocument>('update', function(next) {
    this['updatedAt'] = Date.now();

    next();
});

export const MannaVoucher = model<MannaVoucherDocument>('mannavouchers', mannavoucher);
