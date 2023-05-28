import { Document, Schema, model } from 'mongoose';
import { CHALLENGE_TTL } from '@/lib/constants';

export interface ChallengeSchema {
  address: string;
  nonce: string;
  ack: boolean;
  expiresAt: Date;
  createdAt?: Date;
}

export interface ChallengeInput {
  address: string;
}

export interface ChallengeDocument extends ChallengeSchema, Document {}

const challenge = new Schema<ChallengeDocument>({
  address: {
    type: String,
    required: true,
  },
  nonce: {
    type: String,
    required: true,
  },
  ack: {
    type: Boolean,
    required: true,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + CHALLENGE_TTL),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<ChallengeDocument>('challenges', challenge);