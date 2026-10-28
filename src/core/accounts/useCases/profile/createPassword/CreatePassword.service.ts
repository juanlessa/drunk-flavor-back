import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { CreatePassword, CreatePasswordResult } from './createPassword.dtos';

export class CreatePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private hashProvider: IHashProvider,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ userId, password }: CreatePassword): Promise<CreatePasswordResult> {
		const passwordHash = await this.hashProvider.hash(password);

		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(userId);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notExist', {
					path: 'CreatePassword.service.user',
				});
			}
			if (await this.credentialsRepository.existsByUserId(userId)) {
				throw new ConflictError('apiResponses.profile.passwordAlreadyConfigured', {
					path: 'CreatePassword.service.credential',
				});
			}

			await this.credentialsRepository.create({ userId, passwordHash });
			const updatedUser = await this.usersRepository.update({
				id: userId,
				sessionVersion: user.sessionVersion + 1,
			});
			return { user: updatedUser };
		});
	}
}
