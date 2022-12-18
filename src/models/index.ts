import { UserDocument, User } from '@/models/User';
import { Model } from 'mongoose';

export interface Database {
    User: Model<UserDocument>;
}

export const models: Database = {
    User,
};