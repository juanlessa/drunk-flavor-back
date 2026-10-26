import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

/**
 * Credential =
 *     _id: ObjectId
 *     user_id: string (references User._id)
 *     password_hash: string (bcrypt hash of the local password)
 *     created_at: Date
 *     updated_at: Date
 */
export type Credential = DatabaseCommonInfo & {
	user_id: string;
	password_hash: string;
};
