import { IDeleteUser } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class DeleteUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: IDeleteUser): Promise<void> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError(USER_ERRORS.not_exist, { path: 'DeleteUser.service' });
		}

		await this.usersRepository.delete(id);
	}
}

export { DeleteUserService };
