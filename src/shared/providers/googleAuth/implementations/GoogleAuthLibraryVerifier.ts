import { OAuth2Client } from 'google-auth-library';
import { env } from '@/env';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IGoogleTokenVerifier } from '../IGoogleTokenVerifier';
import { GoogleTokenPayload } from '../googleAuth.dtos';

export class GoogleAuthLibraryVerifier implements IGoogleTokenVerifier {
	private client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

	async verify(idToken: string): Promise<GoogleTokenPayload> {
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
				sub: payload.sub,
				email: payload.email,
				email_verified: payload.email_verified,
				given_name: payload.given_name,
				family_name: payload.family_name,
				picture: payload.picture,
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
