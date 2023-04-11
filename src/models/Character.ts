import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface CharacterSchema {
  user: UserDocument;
  task: TaskDocument;
  name: string;
  checkpoint: string;
  training_images: string[];
  uri: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface CharacterDocument extends CharacterSchema, Document {}

const character = new Schema<CharacterDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  task: {
    type: Schema.Types.ObjectId,
    ref: 'tasks',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  checkpoint: {
    type: String,
    required: true,
  },
  training_images: {
    type: [String],
    required: true,
  },
  uri: {
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

character.pre<CharacterDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Character = model<CharacterDocument>('character', character);
