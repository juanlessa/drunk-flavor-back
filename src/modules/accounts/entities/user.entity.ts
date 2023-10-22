import { DatabaseCommonInfo } from '@shared/infra/mongo/types';
import { ROLES } from '@modules/accounts/types/roles';

export type IUser = DatabaseCommonInfo & {
	name: string;
	surname: string;
	email: string;
	password: string;
	role: ROLES;
};
