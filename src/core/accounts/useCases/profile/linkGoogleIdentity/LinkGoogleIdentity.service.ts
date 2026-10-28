import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { ITransactionManager } from '@/shared/transactions/ITransactionManager';
import { LinkGoogleIdentity, LinkGoogleIdentityResult } from './linkGoogleIdentity.dtos';

export class LinkGoogleIdentityService {
	constructor(
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private googleTokenVerifier: IGoogleTokenVerifier,
		private dateProvider: IDateProvider,
		private transactionManager: ITransactionManager,
	) {}

	async execute({ userId, idToken }: LinkGoogleIdentity): Promise<LinkGoogleIdentityResult> {
		const googleIdentity = await this.googleTokenVerifier.verify(idToken);
		if (googleIdentity.isEmailVerified !== true) {
			throw new UnauthorizedError('apiResponses.auth.googleEmailNotVerified', {
				path: 'LinkGoogleIdentity.service.email',
			});
		}

		return this.transactionManager.withTransaction(async () => {
			const user = await this.usersRepository.findById(userId);
			if (!user) {
				throw new NotFoundError('apiResponses.users.notExist', {
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
			const updatedUser = await this.usersRepository.update({
				id: userId,
				sessionVersion: user.sessionVersion + 1,
			});
			return { user: updatedUser };
		});
	}
}
