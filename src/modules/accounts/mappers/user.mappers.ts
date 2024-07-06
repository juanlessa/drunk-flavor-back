import { UserWithoutPassword } from '@/modules/accounts/dtos/user.dtos';
import { User } from '@/modules/accounts/entities/user.entity';

export const omitUserPassword = ({ password, ...userWithoutPassword }: User): UserWithoutPassword => {
	const userProfile: UserWithoutPassword = {
		...userWithoutPassword,
	};
	return userProfile;
};
