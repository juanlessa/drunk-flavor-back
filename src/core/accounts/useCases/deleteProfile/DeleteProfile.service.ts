import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { IUserTokensRepository } from '../../repositories/IUserTokens.repository';
import { DeleteProfile } from './deleteProfile.dtos';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private userTokensRepository: IUserTokensRepository,
	) {}

	async execute({ id }: DeleteProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'DeleteUser.service' });
		}

		await this.usersRepository.delete(id);
		await this.userTokensRepository.deleteByUserId(id);
	}
}
