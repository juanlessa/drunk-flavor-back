import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export const TokenTypes = {
	'email-verification': 'email-verification',
	'forgot-password': 'forgot-password',
} as const;

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes];

export type Token = DatabaseCommonInfo & {
	user_id: string;
	token: string;
	type: TokenType;
	expires_at: Date;
};
