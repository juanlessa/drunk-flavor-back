import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export const instanceOfMongoObjectId = (obj: unknown): obj is Types.ObjectId =>
	obj instanceof Types.ObjectId ||
	obj instanceof ObjectId ||
	(obj !== null && typeof obj === 'object' && 'toHexString' in obj);
