import { IUserProfileResponse } from '@modules/accounts/dtos/user.dtos';
import { User } from '@modules/accounts/entities/user.entity';

export const mapToUserDto = ({ email, name, surname, _id, role }: User): IUserProfileResponse => {
	const userProfile: IUserProfileResponse = { _id, name, surname, email, role };
	return userProfile;
};
