import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';

export interface FollowSchema {
  userFollower: UserDocument;
  userFollowee: UserDocument;
  following: boolean;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface FollowDocument extends FollowSchema, Document {}

const follow = new Schema<FollowDocument>({
  userFollower: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  userFollowee: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  following: {
    type: Boolean,
    default: true,
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

follow.pre<FollowDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Follow = model<FollowDocument>('follow', follow);
