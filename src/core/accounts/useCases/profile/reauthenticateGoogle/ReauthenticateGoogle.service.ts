import { IdentityProviders } from '@/core/accounts/constants/identity.constants';
import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IDateProvider } from '@/shared/providers/date/IDateProvider';
import { IGoogleTokenVerifier } from '@/shared/providers/googleAuth/IGoogleTokenVerifier';
import { GoogleReauthenticationResult, ReauthenticateGoogle } from './reauthenticateGoogle.dtos';

export class ReauthenticateGoogleService {
	constructor(
		private googleTokenVerifier: IGoogleTokenVerifier,
		private identitiesRepository: IIdentitiesRepository,
		private dateProvider: IDateProvider,
	) {}

	async execute({ userId, idToken }: ReauthenticateGoogle): Promise<GoogleReauthenticationResult> {
		const googleIdentity = await this.googleTokenVerifier.verify(idToken);
		const identity = await this.identitiesRepository.findByProviderSub(
			IdentityProviders.google,
			googleIdentity.subject,
		);

		if (!identity || identity.user_id !== userId) {
			throw new UnauthorizedError('apiResponses.profile.invalidReauthentication', {
				path: 'ReauthenticateGoogle.service',
				cause: 'Google identity is not linked to the authenticated user',
			});
		}

		return {
			method: IdentityProviders.google,
			authenticatedAt: this.dateProvider.dateNow(),
		};
	}
}
