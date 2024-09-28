import { Types } from 'mongoose';

export const instanceOfMongoObjectId = (obj: unknown): obj is Types.ObjectId => obj instanceof Types.ObjectId;
