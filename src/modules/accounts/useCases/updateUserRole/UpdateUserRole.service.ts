import { IUpdateUserRole } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@shared/errors/error.lib';

class UpdateUserRoleService {
	constructor(private usersRepository: IUsersRepository) {}

	async execute({ user_id, role }: IUpdateUserRole): Promise<void> {
		const user = await this.usersRepository.findById(user_id);
		if (!user) {
			throw new BadRequestError(USER_ERRORS.not_exist, { path: 'UpdateUserRole.service' });
		}

		await this.usersRepository.update({ id: user_id, role });
	}
}

export { UpdateUserRoleService };
