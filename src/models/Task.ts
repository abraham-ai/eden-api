import { Document, Schema, model } from 'mongoose';
import { GeneratorDocument } from './Generator';
import { CreationDocument } from './Creation';
import { UserDocument } from './User';

export type TaskStatus = 'pending' | 'completed' | 'failed'

export interface TaskSchema {
  user: UserDocument;
  generator: GeneratorDocument;
  versionId: string;
  config?: any;
  cost: number;
  taskId: string;
  status: TaskStatus;
  output?: any[];
  creation?: CreationDocument;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface TaskDocument extends TaskSchema, Document {}

const task = new Schema<TaskDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  generator: {
    type: Schema.Types.ObjectId,
    ref: 'generators',
  },
  versionId: {
    type: String,
    required: true,
  },
  config: {
    type: Schema.Types.Mixed,
    default: {},
  },
  cost: {
    type: Number,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  output: {
    type: [Schema.Types.Mixed],
    default: [],
  },
  creation: {
    type: Schema.Types.ObjectId,
    ref: 'creations',
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

task.pre<TaskDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Task = model<TaskDocument>('tasks', task);
