import { OAuth2Client } from 'google-auth-library';
import { env } from '@/env';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IGoogleTokenVerifier } from '../IGoogleTokenVerifier';
import { VerifiedGoogleIdentity } from '../googleAuth.dtos';

export class GoogleAuthLibraryVerifier implements IGoogleTokenVerifier {
	private client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

	async verify(idToken: string): Promise<VerifiedGoogleIdentity> {
		try {
			const ticket = await this.client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
			const payload = ticket.getPayload();

			if (!payload?.sub) {
				throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
					path: 'GoogleAuthLibraryVerifier',
					cause: 'missing payload/sub',
				});
			}

			return {
				subject: payload.sub,
				email: payload.email,
				isEmailVerified: payload.email_verified === true,
				givenName: payload.given_name,
				familyName: payload.family_name,
				pictureUrl: payload.picture,
			};
		} catch (error) {
			// Any verification failure (bad signature, wrong audience, expired token,
			// malformed payload) maps to the same opaque 401 — never a 500, and the
			// underlying reason is never leaked to the client.
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'GoogleAuthLibraryVerifier',
				cause: error instanceof Error ? error.message : 'token verification failed',
			});
		}
	}
}
