import { ApiKey, ApiKeyDocument } from '../models/ApiKey';
import { Credit, CreditDocument } from '../models/Credit';
import { Creation, CreationDocument } from '../models/Creation';
import { Follow, FollowDocument } from '../models/Follow';
import { Generator, GeneratorDocument } from '../models/Generator';
import { Task, TaskDocument } from '../models/Task';
import { Transaction, TransactionDocument } from '../models/Transaction';
import { UserDocument, User } from '../models/User';
import { Model } from 'mongoose';

export interface Database {
    User: Model<UserDocument>;
    Follow: Model<FollowDocument>;
    ApiKey: Model<ApiKeyDocument>;
    Creation: Model<CreationDocument>;
    Credit: Model<CreditDocument>;
    Transaction: Model<TransactionDocument>;
    Generator: Model<GeneratorDocument>;
    Task: Model<TaskDocument>;
}

export const models: Database = {
    User,
    Follow,
    ApiKey,
    Creation,
    Credit,
    Transaction,
    Generator,
    Task,
};
