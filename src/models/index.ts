import { Model } from 'mongoose';

import { UserDocument, User } from '../models/User';
import { Manna, MannaDocument } from '../models/Manna';
import { ApiKey, ApiKeyDocument } from '../models/ApiKey';
import { Follow, FollowDocument } from '../models/Follow';
import { Task, TaskDocument } from '../models/Task';
import { Creation, CreationDocument } from '../models/Creation';
import { Reaction, ReactionDocument } from '../models/Reaction';
import { Collection, CollectionDocument } from '../models/Collection';
import { CollectionEvent, CollectionEventDocument } from '../models/CollectionEvent';
import { Transaction, TransactionDocument } from '../models/Transaction';
import { Generator, GeneratorDocument } from '../models/Generator';

export interface Database {
    User: Model<UserDocument>;
    Manna: Model<MannaDocument>;
    ApiKey: Model<ApiKeyDocument>;    
    Follow: Model<FollowDocument>;
    Task: Model<TaskDocument>;
    Creation: Model<CreationDocument>;
    Reaction: Model<ReactionDocument>;
    Collection: Model<CollectionDocument>;
    CollectionEvent: Model<CollectionEventDocument>;
    Transaction: Model<TransactionDocument>;
    Generator: Model<GeneratorDocument>;
}

export const models: Database = {
    User,
    Manna,
    ApiKey,
    Follow,
    Task,
    Creation,
    Reaction,
    Collection,
    CollectionEvent,
    Transaction,
    Generator,
};
