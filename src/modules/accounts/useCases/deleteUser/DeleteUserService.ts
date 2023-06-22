import { IDeleteUser } from '@modules/accounts/dtos/Users';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';
import { SafeParseError, z } from 'zod';

const deleteUserSchema = z.object({
	id: z.string({ required_error: 'Drink id is required' }).length(24, { message: 'Drink does not exist.' })
});

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
			throw new AppError('User does not exist');
		}

		await this.usersRepository.delete(id);
	}
}

export { DeleteUserService };
