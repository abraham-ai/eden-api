import { Document, Schema, model } from 'mongoose';

export type TaskStatus = 'submitted' | 'pending' | 'starting' | 'completed' | 'failed'

export interface TaskSchema {
  taskId: string;
  status: TaskStatus;
  generatorId: string;
  versionId: string;
  config: any;
  metadata: any;
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
    default: 'submitted',
  },
  generatorId: {
    type: String,
    required: true,
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
