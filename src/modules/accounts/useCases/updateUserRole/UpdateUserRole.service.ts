import { IUpdateUserRole } from '@modules/accounts/dtos/user.dtos';
import { USER_ERRORS } from '@modules/accounts/errors/user.errors';
import { IUsersRepository } from '@modules/accounts/repositories/IUsers.repository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class UpdateUserRoleService {
	constructor(
		@inject('UsersRepository')
		private usersRepository: IUsersRepository
	) {}
	async execute({ user_id, role }: IUpdateUserRole): Promise<void> {
		const user = await this.usersRepository.findById(user_id);
		if (!user) {
			throw new AppError(USER_ERRORS.not_exist);
		}

		await this.usersRepository.update({ id: user_id, role });
	}
}

export { UpdateUserRoleService };
