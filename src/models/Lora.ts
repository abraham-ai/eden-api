import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface LoraSchema {
  user: UserDocument;
  task: TaskDocument;
  name: string;
  checkpoint: string;
  training_images: string[];
  uri: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface LoraDocument extends LoraSchema, Document {}

const lora = new Schema<LoraDocument>({
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

lora.pre<LoraDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Lora = model<LoraDocument>('lora', lora);
