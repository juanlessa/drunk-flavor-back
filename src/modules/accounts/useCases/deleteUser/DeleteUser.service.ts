import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import AppError from '@shared/errors/AppError';

class DeleteUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: IDeleteUser): Promise<void> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		await this.usersRepository.delete(id);
	}
}

export { DeleteUserService };
