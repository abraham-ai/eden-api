import { ApiKey, ApiKeyDocument } from '@/models/ApiKey';
import { Credit, CreditDocument } from '@/models/Credit';
import { Transaction, TransactionDocument } from '@/models/Transaction';
import { UserDocument, User } from '@/models/User';
import { Model } from 'mongoose';

export interface Database {
    User: Model<UserDocument>;
    ApiKey: Model<ApiKeyDocument>;
    Credit: Model<CreditDocument>;
    Transaction: Model<TransactionDocument>;
}

export const models: Database = {
    User,
    ApiKey,
    Credit,
    Transaction,
};