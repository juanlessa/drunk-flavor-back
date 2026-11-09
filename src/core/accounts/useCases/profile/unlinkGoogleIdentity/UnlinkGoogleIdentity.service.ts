import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { invalidateUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { UnlinkGoogleIdentity, UnlinkGoogleIdentityResult } from './unlinkGoogleIdentity.dtos';

/**
 * Disconnects Google from an account. The account must keep another way to sign in, which today is the password, so
 * a Google-only account cannot be left without any. The avatar is left as it is: the user may have chosen it, and
 * the picture of the Google account stays valid as an image.
 */
export class UnlinkGoogleIdentityService {
	constructor(
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private credentialsRepository: ICredentialsRepository,
		private transactionManager: ITransactionManager,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
	) {}

	async execute({ userId }: UnlinkGoogleIdentity): Promise<UnlinkGoogleIdentityResult> {
		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(userId);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notFound', { path: 'UnlinkGoogleIdentity.service.user' });
			}
			const providers = await this.identitiesRepository.listProvidersByUserId(userId);
			if (!providers.includes(IdentityProviders.google)) {
				throw new NotFoundError('apiResponses.profile.googleNotConnected', {
					path: 'UnlinkGoogleIdentity.service.provider',
				});
			}
			if (!(await this.credentialsRepository.existsByUserId(userId))) {
				throw new ConflictError('apiResponses.profile.passwordRequiredToDisconnectGoogle', {
					path: 'UnlinkGoogleIdentity.service.credential',
				});
			}
			const removed = await this.identitiesRepository.deleteByUserIdAndProvider(userId, IdentityProviders.google);
			if (!removed) {
				throw new NotFoundError('apiResponses.profile.googleNotConnected', {
					path: 'UnlinkGoogleIdentity.service.identity',
				});
			}
			const updatedUser = await invalidateUserSessions(
				this.usersRepository,
				this.sessionVersionMarkerStore,
				userId,
			);
			return { user: updatedUser };
		});
	}
}
