import { UserWithoutPassword } from '@/core/accounts/dtos/user.dtos';
import { User } from '@/core/accounts/entities/user.entity';

export const omitUserPassword = ({ password, ...userWithoutPassword }: User): UserWithoutPassword => {
	const userProfile: UserWithoutPassword = {
		...userWithoutPassword,
	};
	return userProfile;
};
