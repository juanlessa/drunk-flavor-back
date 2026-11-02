import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '@/env';
import { UnauthorizedError } from '@/shared/error/error.lib';
import { GoogleAuthLibraryIdentityProvider } from './GoogleAuthLibraryIdentityProvider';

const { constructorOptions, getToken, verifyIdToken } = vi.hoisted(() => ({
	constructorOptions: vi.fn(),
	getToken: vi.fn(),
	verifyIdToken: vi.fn(),
}));

vi.mock('google-auth-library', () => ({
	OAuth2Client: class {
		constructor(options: unknown) {
			constructorOptions(options);
		}
		getToken = getToken;
		verifyIdToken = verifyIdToken;
	},
}));

const payload = {
	sub: 'google-sub-123',
	email: 'jane@example.com',
	email_verified: true,
	given_name: 'Jane',
	family_name: 'Doe',
	picture: 'https://example.com/jane.png',
	iat: 1_700_000_000,
};

describe('GoogleAuthLibraryIdentityProvider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getToken.mockResolvedValue({ tokens: { id_token: 'id-token', access_token: 'access-token' } });
		verifyIdToken.mockResolvedValue({ getPayload: () => payload });
	});

	it('uses the web client credentials and the popup redirect URI', () => {
		new GoogleAuthLibraryIdentityProvider();

		expect(constructorOptions).toHaveBeenCalledWith({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			redirectUri: 'postmessage',
		});
	});

	it('exchanges the code and maps the verified ID token to an identity', async () => {
		const identity = await new GoogleAuthLibraryIdentityProvider().authenticate('authorization-code');

		expect(getToken).toHaveBeenCalledWith('authorization-code');
		expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'id-token', audience: env.GOOGLE_CLIENT_ID });
		expect(identity).toEqual({
			subject: 'google-sub-123',
			email: 'jane@example.com',
			isEmailVerified: true,
			givenName: 'Jane',
			familyName: 'Doe',
			pictureUrl: 'https://example.com/jane.png',
			issuedAt: new Date(payload.iat * 1000),
		});
	});

	it('treats a missing email_verified claim as unverified', async () => {
		verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'google-sub-123' }) });

		const identity = await new GoogleAuthLibraryIdentityProvider().authenticate('authorization-code');

		expect(identity).toMatchObject({ subject: 'google-sub-123', isEmailVerified: false, issuedAt: undefined });
	});

	it.each([
		['the code exchange fails', () => getToken.mockRejectedValue(new Error('invalid_grant'))],
		['the token response has no ID token', () => getToken.mockResolvedValue({ tokens: {} })],
		['the ID token is invalid', () => verifyIdToken.mockRejectedValue(new Error('Wrong recipient'))],
		['the payload has no subject', () => verifyIdToken.mockResolvedValue({ getPayload: () => ({}) })],
	])('rejects with an opaque 401 when %s', async (_, arrange) => {
		arrange();

		const execution = new GoogleAuthLibraryIdentityProvider().authenticate('authorization-code');

		await expect(execution).rejects.toBeInstanceOf(UnauthorizedError);
		await expect(execution).rejects.toThrow('apiResponses.auth.invalidCredentials');
	});
});
