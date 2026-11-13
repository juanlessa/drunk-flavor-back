import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { hasUsableSessionStatus } from '@/core/accounts/policies/SessionVersion.policy';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleIdentityProvider } from '@/shared/providers/googleAuth/IGoogleIdentityProvider';
import { GoogleReauthenticationResult, ReauthenticateGoogleCommand } from './reauthenticateGoogle.dtos';
import {
	RECENT_AUTHENTICATION_WINDOW_MS,
	REAUTHENTICATION_CLOCK_SKEW_MS,
} from '@/core/accounts/constants/reauthentication.constants';

export class ReauthenticateGoogleService {
	constructor(
		private googleIdentityProvider: IGoogleIdentityProvider,
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, authorizationCode }: ReauthenticateGoogleCommand): Promise<GoogleReauthenticationResult> {
		const googleIdentity = await this.googleIdentityProvider.authenticate(authorizationCode);
		const user = await this.usersRepository.findById(userId);
		const identity = await this.identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			googleIdentity.subject,
		);

		if (!user || !hasUsableSessionStatus(user.status) || !identity || identity.userId !== userId) {
			throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
				path: 'ReauthenticateGoogle.service',
				cause: 'Google identity is not linked to the authenticated user',
			});
		}

		const authenticatedAt = this.dateProvider.dateNow();
		if (googleIdentity.issuedAt) {
			const tokenAge = authenticatedAt.getTime() - googleIdentity.issuedAt.getTime();
			if (
				tokenAge < -REAUTHENTICATION_CLOCK_SKEW_MS ||
				tokenAge > RECENT_AUTHENTICATION_WINDOW_MS + REAUTHENTICATION_CLOCK_SKEW_MS
			) {
				throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
					path: 'ReauthenticateGoogle.service.freshness',
					cause: 'Google authentication is not recent enough for reauthentication',
				});
			}
		}

		return {
			method: IdentityProviders.google,
			authenticatedAt,
		};
	}
}
