import { Document, Schema, model } from 'mongoose';

export interface UserSchema {
    userId: string;
    isWallet: boolean;
    isAdmin: boolean;
    createdat: Date;
    updatedat: Date | number;
}

export interface UserDocument extends UserSchema, Document {}

const user = new Schema<UserDocument>({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    isWallet: {
        type: Boolean,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
    createdat: {
        type: Date,
        default: Date.now,
    },
    updatedat: {
        type: Date,
        default: Date.now,
    },
});

user.pre<UserDocument>('update', function(next) {
    this['updatedat'] = Date.now();

    next();
});

export const User = model<UserDocument>('users', user);
