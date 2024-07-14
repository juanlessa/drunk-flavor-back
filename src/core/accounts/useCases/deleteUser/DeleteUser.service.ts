import { DeleteUser } from '@/core/accounts/dtos/user.dtos';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { USER_MESSAGES } from '@/core/accounts/constants/users.constants';
import { BadRequestError } from '@/shared/error/error.lib';

export class DeleteUserService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ id }: DeleteUser) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError(USER_MESSAGES.notExist.message, { path: 'DeleteUser.service' });
		}

		await this.usersRepository.delete(id);
	}
}
