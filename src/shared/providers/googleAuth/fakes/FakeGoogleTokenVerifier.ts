import { IGoogleTokenVerifier } from '../IGoogleTokenVerifier';
import { VerifiedGoogleIdentity } from '../googleAuth.dtos';

const DEFAULT_IDENTITY: VerifiedGoogleIdentity = {
	subject: 'fake-google-sub',
	email: 'fake-google-user@example.com',
	isEmailVerified: true,
	givenName: 'Fake',
	familyName: 'User',
	pictureUrl: 'https://example.com/avatar.png',
};

/**
 * Deterministic in-memory verifier for tests. It never touches the Google
 * network: `verify` resolves the queued identity or rejects with the queued
 * error, defaulting to a verified Google identity. Mirrors FakeTransactionManager
 * in spirit — a tiny, controllable stand-in for the real provider.
 */
export class FakeGoogleTokenVerifier implements IGoogleTokenVerifier {
	private nextIdentity: VerifiedGoogleIdentity = { ...DEFAULT_IDENTITY };
	private nextError: unknown = null;

	setNextIdentity(identity: VerifiedGoogleIdentity): void {
		this.nextIdentity = identity;
		this.nextError = null;
	}

	setNextError(error: unknown): void {
		this.nextError = error;
	}

	reset(): void {
		this.nextIdentity = { ...DEFAULT_IDENTITY };
		this.nextError = null;
	}

	async verify(_idToken: string): Promise<VerifiedGoogleIdentity> {
		if (this.nextError) {
			const error = this.nextError;
			this.nextError = null;
			throw error;
		}
		return this.nextIdentity;
	}
}

/**
 * Module-level singleton driven by e2e specs that hit the resolver rather than
 * constructing the verifier directly. The exported setters let a test queue the
 * identity/error for the next POST /auth/google request.
 */
export const fakeGoogleTokenVerifier = new FakeGoogleTokenVerifier();

export const setNextVerifiedGoogleIdentity = (identity: VerifiedGoogleIdentity): void =>
	fakeGoogleTokenVerifier.setNextIdentity(identity);

export const setNextGoogleTokenError = (error: unknown): void => fakeGoogleTokenVerifier.setNextError(error);

export const resetFakeGoogleTokenVerifier = (): void => fakeGoogleTokenVerifier.reset();
