import { Document, Schema, model } from 'mongoose';

export interface GeneratorVersionSchema {
  versionId: string;
  defaultConfig: any;
  isDeprecated: boolean;
  createdAt: Date;
}

export interface GeneratorVersionDocument extends GeneratorVersionSchema, Document {}

const generatorVersion = new Schema<GeneratorVersionDocument>({
  versionId: {
    type: String,
    required: true,
  },
  isDeprecated: {
    type: Boolean,
    default: false,
  },
  defaultConfig: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface GeneratorSchema {
  generatorName: string;
  versions: GeneratorVersionSchema[]
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface GeneratorDocument extends GeneratorSchema, Document {}

const generator = new Schema<GeneratorDocument>({
  generatorName: {
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
