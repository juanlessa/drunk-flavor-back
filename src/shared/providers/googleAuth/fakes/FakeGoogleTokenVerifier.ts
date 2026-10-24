import { GoogleTokenPayload, IGoogleTokenVerifier } from '../IGoogleTokenVerifier';

const DEFAULT_PAYLOAD: GoogleTokenPayload = {
	sub: 'fake-google-sub',
	email: 'fake-google-user@example.com',
	email_verified: true,
	given_name: 'Fake',
	family_name: 'User',
	picture: 'https://example.com/avatar.png',
};

/**
 * Deterministic in-memory verifier for tests. It never touches the Google
 * network: `verify` resolves the queued payload or rejects with the queued
 * error, defaulting to a verified Google payload. Mirrors FakeTransactionManager
 * in spirit — a tiny, controllable stand-in for the real provider.
 */
export class FakeGoogleTokenVerifier implements IGoogleTokenVerifier {
	private nextPayload: GoogleTokenPayload = { ...DEFAULT_PAYLOAD };
	private nextError: unknown = null;

	setNextPayload(payload: GoogleTokenPayload): void {
		this.nextPayload = payload;
		this.nextError = null;
	}

	setNextError(error: unknown): void {
		this.nextError = error;
	}

	reset(): void {
		this.nextPayload = { ...DEFAULT_PAYLOAD };
		this.nextError = null;
	}

	async verify(_idToken: string): Promise<GoogleTokenPayload> {
		if (this.nextError) {
			const error = this.nextError;
			this.nextError = null;
			throw error;
		}
		return this.nextPayload;
	}
}

/**
 * Module-level singleton driven by e2e specs that hit the resolver rather than
 * constructing the verifier directly. The exported setters let a test queue the
 * payload/error for the next POST /auth/google request.
 */
export const fakeGoogleTokenVerifier = new FakeGoogleTokenVerifier();

export const setNextGoogleTokenPayload = (payload: GoogleTokenPayload): void =>
	fakeGoogleTokenVerifier.setNextPayload(payload);

export const setNextGoogleTokenError = (error: unknown): void => fakeGoogleTokenVerifier.setNextError(error);

export const resetFakeGoogleTokenVerifier = (): void => fakeGoogleTokenVerifier.reset();
