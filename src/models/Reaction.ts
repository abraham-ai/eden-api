import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';


export interface ReactionSchema {
  user: ObjectId;
  reaction: String;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface ReactionDocument extends ReactionSchema, Document {}

const reactions = new Schema<ReactionDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  reaction: {
    type: String,
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

reactions.pre<ReactionDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Reaction = model<ReactionDocument>('reactions', reactions);
