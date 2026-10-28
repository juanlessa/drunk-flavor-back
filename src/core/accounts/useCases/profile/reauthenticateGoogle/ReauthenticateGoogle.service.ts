import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { UserStatuses } from '@/core/accounts/constants/user.constants';
import { IUsersRepository } from '@/core/accounts/repositories/IUsers.repository';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { GoogleReauthenticationResult, ReauthenticateGoogle } from './reauthenticateGoogle.dtos';
import {
	RECENT_AUTHENTICATION_WINDOW_MS,
	REAUTHENTICATION_CLOCK_SKEW_MS,
} from '@/core/accounts/constants/reauthentication.constants';

export class ReauthenticateGoogleService {
	constructor(
		private googleTokenVerifier: IGoogleTokenVerifier,
		private usersRepository: IUsersRepository,
		private identitiesRepository: IIdentitiesRepository,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, idToken }: ReauthenticateGoogle): Promise<GoogleReauthenticationResult> {
		const googleIdentity = await this.googleTokenVerifier.verify(idToken);
		const user = await this.usersRepository.findById(userId);
		const identity = await this.identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			googleIdentity.subject,
		);

		if (
			!user ||
			(user.status !== UserStatuses.active && user.status !== UserStatuses.incomplete_profile) ||
			!identity ||
			identity.userId !== userId
		) {
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
					cause: 'Google ID token is not recent enough for reauthentication',
				});
			}
		}

		return {
			method: IdentityProviders.google,
			authenticatedAt,
		};
	}
}
