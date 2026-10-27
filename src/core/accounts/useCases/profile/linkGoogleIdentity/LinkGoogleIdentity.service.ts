import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { ConflictError, NotFoundError, UnauthorizedError } from '@/shared/error/error.lib';
import { IHashProvider } from '@/shared/providers/cryptography/IHash.provider';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { LinkGoogleIdentity } from './linkGoogleIdentity.dtos';

export class LinkGoogleIdentityService {
	constructor(
		private usersRepository: IUsersRepository,
		private credentialsRepository: ICredentialsRepository,
		private identitiesRepository: IIdentitiesRepository,
		private googleTokenVerifier: IGoogleTokenVerifier,
		private hashProvider: IHashProvider,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, currentPassword, idToken }: LinkGoogleIdentity): Promise<void> {
		const user = await this.usersRepository.findById(userId);
		if (!user) {
			throw new NotFoundError('apiResponses.users.notExist', {
				path: 'LinkGoogleIdentity.service.user',
			});
		}

		const credential = await this.credentialsRepository.findByUserId(userId);
		const passwordHash = credential?.password_hash ?? (await this.hashProvider.getDummyHash());
		if (!credential || !(await this.hashProvider.compare(currentPassword, passwordHash))) {
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'LinkGoogleIdentity.service.password',
				cause: 'Current password is invalid',
			});
		}

		const googleIdentity = await this.googleTokenVerifier.verify(idToken);
		if (googleIdentity.isEmailVerified !== true) {
			throw new UnauthorizedError('apiResponses.auth.googleEmailNotVerified', {
				path: 'LinkGoogleIdentity.service.email',
			});
		}

		const existingIdentity = await this.identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			googleIdentity.subject,
		);
		if (existingIdentity) {
			throw new ConflictError(
				existingIdentity.user_id === userId
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
			user_id: userId,
			provider: IdentityProviders.google,
			provider_sub: googleIdentity.subject,
			email: googleIdentity.email?.toLowerCase(),
			email_verified: true,
			picture: googleIdentity.pictureUrl,
			last_login_at: this.dateProvider.dateNow(),
		});
	}
}
