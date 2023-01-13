import { ObjectId } from 'mongodb';
import { Document, Schema, model } from 'mongoose';

export type TaskStatus = 'pending' | 'completed' | 'failed'

export interface TaskSchema {
  taskId: string;
  status: TaskStatus;
  user: ObjectId;
  generator: ObjectId
  versionId: string;
  config?: any;
  metadata?: any;
  intermediateOutput?: string[];
  output?: string[];
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface TaskDocument extends TaskSchema, Document {}

const task = new Schema<TaskDocument>({
  taskId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
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
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  intermediateOutput: {
    type: [String],
    default: [],
  },
  output: {
    type: [String],
    default: [],
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

export const Task = model<TaskDocument>('Tasks', task);
