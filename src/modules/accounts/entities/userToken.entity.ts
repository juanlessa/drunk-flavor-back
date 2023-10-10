import { DatabaseCommonInfo } from '@shared/infra/database/mongo/types';

export type IUserToken = DatabaseCommonInfo & {
	user_id: string;
	refresh_token: string;
	expires_date: Date;
};
