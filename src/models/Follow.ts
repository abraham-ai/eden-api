import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export interface FollowSchema {
  userFollower: ObjectId;
  userFollowee: ObjectId;
  followedAt?: Date | number;
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
  followedAt: {
    type: Date,
    default: Date.now,
  },
});

follow.pre<FollowDocument>('update', function(next) {
  this['followedAt'] = Date.now();

  next();
});

export const Follow = model<FollowDocument>('follow', follow);
