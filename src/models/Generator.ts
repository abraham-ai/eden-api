import { Document, Schema, model } from 'mongoose';

export interface GeneratorParameter {
  name: string;
  defaultValue?: any;
  isRequired?: boolean;
  allowedValues?: any[];
  minimum?: number;
  maximum?: number;
}

export interface GeneratorVersionSchema {
  versionId: string;
  defaultParameters: GeneratorParameter[];
  creationAttributes: string[];
  isDeprecated: boolean;
  createdAt: Date;
}

export interface GeneratorVersionDocument extends GeneratorVersionSchema, Document {}

const generatorVersion = new Schema<GeneratorVersionDocument>({
  versionId: {
    type: String,
    required: true,
  },
  defaultParameters: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        defaultValue: {
          type: Schema.Types.Mixed,
          required: true,
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
        allowedValues: {
          type: [Schema.Types.Mixed],
          default: [],
        },
        minimum: {
          type: Number,
        },
        maximum: {
          type: Number,
        },
      },
    ],
    default: [],
  },
  creationAttributes: {
    type: [String],
    default: [],
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
    type: [generatorVersion],
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

export const Generator = model<GeneratorDocument>('generators', generator);
