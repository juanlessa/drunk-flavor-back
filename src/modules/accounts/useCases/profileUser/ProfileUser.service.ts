import { IUserProfileRequest, IUserProfileResponse } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { mapToUserDto } from '@modules/accounts/mappers/user.mapper';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class ProfileUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute({ id }: IUserProfileRequest): Promise<IUserProfileResponse> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		return mapToUserDto(user);
	}
}

export { ProfileUserService };
