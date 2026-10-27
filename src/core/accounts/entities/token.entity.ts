import { EntityMetadata } from '@/shared/types/entity.types';
import { TokenTypes } from '../constants/token.constants';

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

/**
 * Token =
 *     id: string
 *     userId: string (references User.id)
 *     tokenHash: string (hash of the plaintext action token sent to the user)
 *     type: TokenType ("email-verification" | "forgot-password")
 *     expiresAt: Date (TTL-indexed; the document is removed after it passes)
 *     createdAt: Date
 *     updatedAt: Date
 */
export type Token = EntityMetadata & {
	userId: string;
	tokenHash: string;
	type: TokenType;
	expiresAt: Date;
};
