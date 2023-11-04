import { BadRequestError } from './../../../../shared/errors/error.lib';
import { IUserProfileRequest, IUserProfileResponse } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { mapToUserDto } from '@modules/accounts/mappers/user.mapper';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';

class ProfileUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: IUserProfileRequest): Promise<IUserProfileResponse> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError(USER_ERRORS.not_exist, { path: 'ProfileUser.service' });
		}

		return mapToUserDto(user);
	}
}

export { ProfileUserService };
