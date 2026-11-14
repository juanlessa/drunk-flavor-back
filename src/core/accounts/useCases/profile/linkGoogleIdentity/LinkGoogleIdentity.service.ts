import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleIdentityProvider } from '@/shared/providers/googleAuth/IGoogleIdentityProvider';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { LinkGoogleIdentityCommand, LinkGoogleIdentityResult } from './linkGoogleIdentity.dtos';
import { ISessionVersionMarkerStore } from '@/core/accounts/stores/ISessionVersionMarker.store';
import { invalidateUserSessions } from '@/core/accounts/helpers/sessionInvalidation.helpers';

export class LinkGoogleIdentityService {
	constructor(
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private googleIdentityProvider: IGoogleIdentityProvider,
		private dateProvider: IDateProvider,
		private transactionManager: ITransactionManager,
		private sessionVersionMarkerStore: ISessionVersionMarkerStore,
	) {}

	async execute({ userId, authorizationCode }: LinkGoogleIdentityCommand): Promise<LinkGoogleIdentityResult> {
		const googleIdentity = await this.googleIdentityProvider.authenticate(authorizationCode);
		if (googleIdentity.isEmailVerified !== true) {
			throw new UnauthorizedError('apiResponses.auth.googleEmailNotVerified', {
				path: 'LinkGoogleIdentity.service.email',
			});
		}

		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(userId);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notFound', {
					path: 'LinkGoogleIdentity.service.user',
				});
			}

			const existingIdentity = await this.identitiesRepository.findByProviderSub(
				IdentityProviders.google,
				googleIdentity.subject,
			);
			if (existingIdentity) {
				throw new ConflictError(
					existingIdentity.userId === userId
						? 'apiResponses.profile.googleAlreadyConnected'
						: 'apiResponses.profile.googleIdentityUnavailable',
					{ path: 'LinkGoogleIdentity.service.identity' },
				);
			}

			const providers = await this.identitiesRepository.listProvidersByUserId(userId);
			if (providers.includes(IdentityProviders.google)) {
				throw new ConflictError('apiResponses.profile.googleAlreadyConnected', {
					path: 'LinkGoogleIdentity.service.provider',
				});
			}

			await this.identitiesRepository.create({
				userId,
				provider: IdentityProviders.google,
				providerSubject: googleIdentity.subject,
				email: googleIdentity.email?.toLowerCase(),
				isEmailVerified: true,
				pictureUrl: googleIdentity.pictureUrl,
				lastLoginAt: this.dateProvider.dateNow(),
			});
			// A user without an avatar takes the picture of the Google account; an avatar the user chose is kept.
			if (!user.avatarUrl && googleIdentity.pictureUrl) {
				await this.usersRepository.update({ id: userId, avatarUrl: googleIdentity.pictureUrl });
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
