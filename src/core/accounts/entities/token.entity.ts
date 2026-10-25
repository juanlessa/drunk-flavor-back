import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';
import { TokenTypes } from '../constants/token.constants';

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export type Token = DatabaseCommonInfo & {
	user_id: string;
	token_hash: string;
	type: TokenType;
	expires_at: Date;
};
