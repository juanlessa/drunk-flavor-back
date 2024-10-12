import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export enum TokenTypeEnum {
	'email-verification' = 'email-verification',
	'forgot-password' = 'forgot-password',
}

export type TokenType = keyof typeof TokenTypeEnum;

export type UserToken = DatabaseCommonInfo & {
	user_id: string;
	token: string;
	type: TokenType;
};
