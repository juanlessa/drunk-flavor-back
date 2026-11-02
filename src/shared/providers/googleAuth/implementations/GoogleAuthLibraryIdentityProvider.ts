import { OAuth2Client } from 'google-auth-library';
import { env } from '@/env';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { IGoogleIdentityProvider } from '../IGoogleIdentityProvider';
import { VerifiedGoogleIdentity } from '../googleAuth.dtos';

/**
 * Codes from the GIS popup flow are bound to the `postmessage` redirect URI, which Google requires on the exchange.
 * See https://developers.google.com/identity/oauth2/web/guides/use-code-model
 */
const POPUP_REDIRECT_URI = 'postmessage';

export class GoogleAuthLibraryIdentityProvider implements IGoogleIdentityProvider {
	private client = new OAuth2Client({
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		redirectUri: POPUP_REDIRECT_URI,
	});

	async authenticate(authorizationCode: string): Promise<VerifiedGoogleIdentity> {
		try {
			// Only the ID token is used: the access token is discarded and no refresh token is requested
			// (no offline access), so nothing from Google needs to be stored.
			const { tokens } = await this.client.getToken(authorizationCode);
			if (!tokens.id_token) {
				throw new Error('token response without an ID token');
			}

			const ticket = await this.client.verifyIdToken({
				idToken: tokens.id_token,
				audience: env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			if (!payload?.sub) {
				throw new Error('missing payload/sub');
			}

			return {
				subject: payload.sub,
				email: payload.email,
				isEmailVerified: payload.email_verified === true,
				givenName: payload.given_name,
				familyName: payload.family_name,
				pictureUrl: payload.picture,
				issuedAt: typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : undefined,
			};
		} catch (error) {
			// Any failure (invalid, expired or reused code, bad signature, wrong audience, malformed payload) maps to
			// the same opaque 401 — never a 500, and the underlying reason is never leaked to the client.
			throw new UnauthorizedError('apiResponses.auth.invalidCredentials', {
				path: 'GoogleAuthLibraryIdentityProvider',
				cause: error instanceof Error ? error.message : 'Google authentication failed',
			});
		}
	}
}
