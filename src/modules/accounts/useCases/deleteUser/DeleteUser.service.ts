import { DeleteUser } from '@/modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { USER_MESSAGES } from '@/shared/constants/ResponseMessages';
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
