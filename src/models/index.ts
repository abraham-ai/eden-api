import { Model } from 'mongoose';

import { UserDocument, User } from '../models/User';
import { Manna, MannaDocument } from '../models/Manna';
import { MannaVoucher, MannaVoucherDocument } from '../models/MannaVoucher';
import { ApiKey, ApiKeyDocument } from '../models/ApiKey';
import { Follow, FollowDocument } from '../models/Follow';
import { Task, TaskDocument } from '../models/Task';
import { Creation, CreationDocument } from '../models/Creation';
import { Reaction, ReactionDocument } from '../models/Reaction';
import { Collection, CollectionDocument } from '../models/Collection';
import { CollectionEvent, CollectionEventDocument } from '../models/CollectionEvent';
import { Transaction, TransactionDocument } from '../models/Transaction';
import { LiveMint, LiveMintDocument } from '../models/LiveMint';
import { Generator, GeneratorDocument } from '../models/Generator';
import { Lora, LoraDocument } from '../models/Lora';
import { Character, CharacterDocument } from '../models/Character';
import { LlmCompletion, LlmCompletionDocument } from '../models/LlmCompletion';

export interface Database {
    User: Model<UserDocument>;
    Manna: Model<MannaDocument>;
    MannaVoucher: Model<MannaVoucherDocument>;
    ApiKey: Model<ApiKeyDocument>;    
    Follow: Model<FollowDocument>;
    Task: Model<TaskDocument>;
    Creation: Model<CreationDocument>;
    Reaction: Model<ReactionDocument>;
    Collection: Model<CollectionDocument>;
    CollectionEvent: Model<CollectionEventDocument>;
    Transaction: Model<TransactionDocument>;
    LiveMint: Model<LiveMintDocument>;
    Generator: Model<GeneratorDocument>;
    Lora: Model<LoraDocument>;
    Character: Model<CharacterDocument>;
    LlmCompletion: Model<LlmCompletionDocument>;
}

export const models: Database = {
    User,
    Manna,
    MannaVoucher,
    ApiKey,
    Follow,
    Task,
    Creation,
    Reaction,
    Collection,
    CollectionEvent,
    Transaction,
    LiveMint,
    Generator,
    Lora,
    Character,
    LlmCompletion,
};
