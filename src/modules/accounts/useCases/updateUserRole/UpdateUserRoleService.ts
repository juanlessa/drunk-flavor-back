import { IUpdateUserRole } from '@modules/accounts/dtos/Users';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { updateUserRoleSchema } from '@modules/accounts/validations/users';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class UpdateUserRoleService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute(data: IUpdateUserRole): Promise<void> {
		const result = updateUserRoleSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IUpdateUserRole>;
			throw new AppError(error.issues[0].message);
		}
		const { userId, role } = result.data;

		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		user.role = role;

		await this.usersRepository.update(user);
	}
}

export { UpdateUserRoleService };
