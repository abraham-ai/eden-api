import { Document, Schema, model } from 'mongoose';

export interface UserSchema {
  userId: string;
  isWallet: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date | number;
}

export interface UserDocument extends UserSchema, Document {}

const user = new Schema<UserDocument>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  isWallet: {
    type: Boolean,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
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

user.pre<UserDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const User = model<UserDocument>('users', user);
