import { Document, Schema, model } from 'mongoose';
import { UserDocument } from './User';
import { TaskDocument } from './Task';

export interface LlmCompletionSchema {
  user: UserDocument;
  task: TaskDocument;
  completion: string;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface LlmCompletionDocument extends LlmCompletionSchema, Document {}

const llmCompletion = new Schema<LlmCompletionDocument>({
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
  completion: {
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

llmCompletion.pre<LlmCompletionDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const LlmCompletion = model<LlmCompletionDocument>('llmCompletion', llmCompletion);
