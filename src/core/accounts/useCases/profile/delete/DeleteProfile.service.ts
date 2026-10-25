import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ITokensRepository } from '@/core/accounts/repositories/ITokens.repository';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { DeleteProfile } from './deleteProfile.dtos';

export class DeleteProfileService {
	constructor(
		private usersRepository: IUsersRepository,
		private tokensRepository: ITokensRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ id }: DeleteProfile) {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new BadRequestError('apiResponses.users.notExist', { path: 'DeleteProfile.service' });
		}

		await this.transactionManager.withTransaction(async () => {
			await this.usersRepository.delete(id);
			await this.credentialsRepository.deleteByUserId(id);
			await this.identitiesRepository.deleteByUserId(id);
			await this.tokensRepository.deleteByUserId(id);
		});
		// TODO: Enqueue engagement cleanup for comments and ratings by user id.
	}
}
