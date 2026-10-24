import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { DeleteProfile } from './deleteProfile.dtos';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
	) {}

	async execute({ id }: DeleteProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'DeleteUser.service' });
		}

		await this.usersRepository.delete(id);
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
		await this.tokensRepository.deleteByUserId(id);
	}
}
