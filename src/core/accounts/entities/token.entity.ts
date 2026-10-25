import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { TokenTypes } from '../constants/token.constants';

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

/**
 * Token =
 *     _id: ObjectId
 *     user_id: string (references User._id)
 *     token_hash: string (hash of the plaintext action token sent to the user)
 *     type: TokenType ("email-verification" | "forgot-password")
 *     expires_at: Date (TTL-indexed; the document is removed after it passes)
 *     created_at: Date
 *     updated_at: Date
 */
export type Token = DatabaseCommonInfo & {
	user_id: string;
	token_hash: string;
	type: TokenType;
	expires_at: Date;
};
