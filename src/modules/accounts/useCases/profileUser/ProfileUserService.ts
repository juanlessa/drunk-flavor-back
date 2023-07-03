import { IProfileUser, IUserProfileResponse } from '@modules/accounts/dtos/Users';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { UserMap } from '@modules/accounts/mappers/UserMap';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { profileUserSchema } from '@modules/accounts/validations/users';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class ProfileUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute(data: IProfileUser): Promise<IUserProfileResponse> {
		const result = profileUserSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IProfileUser>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const user = await this.usersRepository.findById(id);

		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		return UserMap.toDTO(user);
	}
}

export { ProfileUserService };
