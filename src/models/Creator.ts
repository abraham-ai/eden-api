import { Document, Schema, model } from 'mongoose';
import { CreationDocument } from './Creation';
import { CollectionDocument } from './Collection';

export interface UserSchema {
  userId: string;
  isWallet: boolean;
  isAdmin: boolean;
  creations: CreationDocument[];
  collections: CollectionDocument[];
  username?: string;
  name?: string;
  bio?: string;
  email?: string;
  profilePictureUri?: string;
  coverPictureUri?: string;
  website?: string;
  discordId?: string;
  twitterId?: string;
  instagramId?: string;
  githubId?: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface UserInput {
  userId: string;
  username: string;
  isWallet: boolean;
  isAdmin?: boolean;
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
  username: {
    type: String,
    required: false,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
  },
  bio: {
    type: String,
  },
  email: {
    type: String,
  },
  profilePictureUri: {
    type: String,
  },
  coverPictureUri: {
    type: String,
  },
  website: {
    type: String,
  },
  discordId: {
    type: String,
  },
  twitterId: {
    type: String,
  },
  instagramId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  creations: [{
    type: Schema.Types.ObjectId,
    ref: 'creations',
  }],
  collections: [{
    type: Schema.Types.ObjectId,
    ref: 'collections',
  }],
});

user.pre<UserDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const User = model<UserDocument>('users', user);
