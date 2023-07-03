import { IDeleteUser } from '@modules/accounts/dtos/Users';
import { USER_ERRORS } from '@modules/accounts/errors/userErrors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { deleteUserSchema } from '@modules/accounts/validations/users';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError } from 'zod';

@injectable()
class DeleteUserService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute(data: IDeleteUser) {
		const result = deleteUserSchema.safeParse(data);
		if (!result.success) {
			const { error } = result as SafeParseError<IDeleteUser>;
			throw new AppError(error.issues[0].message);
		}
		const { id } = result.data;

		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		await this.usersRepository.delete(id);
	}
}

export { DeleteUserService };
