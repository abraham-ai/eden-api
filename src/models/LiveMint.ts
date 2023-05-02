import { Document, Schema, model } from 'mongoose';

export interface LiveMintSchema {
  mintId: string;
  block: number;
  txHash: string;
  caller: string;
  tokenId: number;
  ack: boolean;
  taskId: string;
  edenSuccess: boolean;
  imageUri: string;
  ipfsUri: string;
  ipfsImageUri: string;
  txSuccess: boolean;
  createdAt?: Date;
  updatedAt?: Date | number;
}

export interface LiveMintDocument extends LiveMintSchema, Document {}

const livemint = new Schema<LiveMintDocument>({

  mintId: {
    type: String,
    required: true,
  },
  block: {
    type: Number,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  caller: {
    type: String,
    required: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  ack: {
    type: Boolean,
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  edenSuccess: {
    type: Boolean,
    required: true,
  },
  imageUri: {
    type: String,
    required: true,
  },
  ipfsUri: {
    type: String,
    required: true,
  },
  ipfsImageUri: {
    type: String,
    required: true,
  },
  txSuccess: {
    type: Boolean,
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

livemint.pre<LiveMintDocument>('update', function(next) {
  this['updatedAt'] = Date.now();

  next();
});

export const LiveMint = model<LiveMintDocument>('livemints', livemint);
