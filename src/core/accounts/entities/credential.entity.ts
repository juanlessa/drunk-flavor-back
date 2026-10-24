import { DatabaseCommonInfo } from '@/infrastructure/mongo/types';

export type Credential = DatabaseCommonInfo & {
	user_id: string;
	password_hash: string;
};
