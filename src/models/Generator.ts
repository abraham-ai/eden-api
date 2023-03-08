import { Document, Schema, model } from 'mongoose';

export interface GeneratorParameter {
  name: string;
  label: string;
  description?: string;
  isRequired?: boolean;
  default?: any;
  allowedValues?: any[];
  allowedValuesFrom?: string;
  minimum?: number;
  maximum?: number;
  step: number;
}

export interface GeneratorVersionSchema {
  provider: string;
  address: string;
  versionId: string;
  mode: string;
  parameters: GeneratorParameter[];
  creationAttributes: string[];
  isDeprecated: boolean;
  createdAt: Date;
}

export interface GeneratorVersionDocument extends GeneratorVersionSchema, Document {}

const generatorVersion = new Schema<GeneratorVersionDocument>({
  provider: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  versionId: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  parameters: {
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
        default: {
          type: Schema.Types.Mixed,
          required: true,
        },
        allowedValues: {
          type: [Schema.Types.Mixed],
          default: [],
        },
        allowedValuesFrom: {
          type: String,
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

type GeneratorOutputType = 'creation' | 'llm' | 'lora';

export interface GeneratorSchema {
  generatorName: string;
  description: string;
  versions: GeneratorVersionSchema[];
  output: GeneratorOutputType;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface GeneratorDocument extends GeneratorSchema, Document {}

const generator = new Schema<GeneratorDocument>({
  generatorName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  output: {
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
