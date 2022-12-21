import { Document, Schema, model } from 'mongoose';

export interface GeneratorVersion {
  versionId: string;
  isDeprecated: boolean;
  createdAt: Date;
}

export interface GeneratorVersionDocument extends GeneratorVersion, Document {}

const generatorVersion = new Schema<GeneratorVersionDocument>({
  versionId: {
    type: String,
    required: true,
  },
  isDeprecated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface GeneratorSchema {
  service: string
  name: string
  versions: GeneratorVersion[]
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface GeneratorDocument extends GeneratorSchema, Document {}

const generator = new Schema<GeneratorDocument>({
  service: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  versions: {
    children: [generatorVersion],
    childSchema: generatorVersion,
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

generator.pre<GeneratorDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const Generator = model<GeneratorDocument>('apiKeys', generator);
