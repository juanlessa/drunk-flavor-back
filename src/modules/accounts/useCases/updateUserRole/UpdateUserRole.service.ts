import { UpdateUserRole } from '@/modules/accounts/dtos/user.dtos';
import { IUsersRepository } from '@/modules/accounts/repositories/IUsers.repository';
import { USER_MESSAGES } from '@/modules/accounts/constants/users.constants';
import { BadRequestError } from '@/shared/error/error.lib';

export class UpdateUserRoleService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ user_id, role }: UpdateUserRole) {
		const user = await this.usersRepository.findById(user_id);
		if (!user) {
			throw new BadRequestError(USER_MESSAGES.notExist.message, { path: 'UpdateUserRole.service' });
		}

		await this.usersRepository.update({ id: user_id, role });
	}
}
