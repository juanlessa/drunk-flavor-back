import { IUserProfileResponse } from '@modules/accounts/dtos/user.dtos';
import { IUser } from '@modules/accounts/entities/user.entity';

export const mapToUserDto = ({
	_id,
	name,
	surname,
	email,
	role,
	created_at,
	updated_at
}: IUser): IUserProfileResponse => {
	const userProfile: IUserProfileResponse = { _id, name, surname, email, role, created_at, updated_at };
	return userProfile;
};
