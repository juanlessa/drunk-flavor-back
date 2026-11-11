import { invalidateUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { RemovePassword, RemovePasswordResult } from './removePassword.dtos';

/**
 * Removes the password from an account. The account must keep another way to sign in, which today is a connected
 * provider, so a password-only account cannot be left without any.
 */
export class RemovePasswordService {
	constructor(
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private credentialsRepository: ICredentialsRepository,
		private transactionManager: ITransactionManager,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
	) {}

	async execute({ userId }: RemovePassword): Promise<RemovePasswordResult> {
		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(userId);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notFound', { path: 'RemovePassword.service.user' });
			}

			if (!(await this.credentialsRepository.existsByUserId(userId))) {
				throw new NotFoundError('apiResponses.profile.passwordNotConfigured', {
					path: 'RemovePassword.service.credential',
				});
			}

			const providers = await this.identitiesRepository.listProvidersByUserId(userId);
			if (providers.length === 0) {
				throw new ConflictError('apiResponses.profile.providerRequiredToRemovePassword', {
					path: 'RemovePassword.service.provider',
				});
			}

			await this.credentialsRepository.deleteByUserId(userId);

			const updatedUser = await invalidateUserSessions(
				this.usersRepository,
				this.sessionVersionMarkerStore,
				userId,
			);
			return { user: updatedUser };
		});
	}
}
