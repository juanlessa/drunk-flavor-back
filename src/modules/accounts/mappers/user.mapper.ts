import { IUserProfileResponse } from '@/modules/accounts/dtos/user.dtos';
import { IUser } from '@/modules/accounts/entities/user.entity';

export const mapToUserDto = ({ password, ...userWithoutPassword }: IUser): IUserProfileResponse => {
	const userProfile: IUserProfileResponse = {
		...userWithoutPassword,
	};
	return userProfile;
};
