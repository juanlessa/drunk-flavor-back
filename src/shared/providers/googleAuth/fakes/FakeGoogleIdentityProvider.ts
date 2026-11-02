import { IGoogleIdentityProvider } from '../IGoogleIdentityProvider';
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
 * Deterministic in-memory identity provider for tests. It never touches the Google
 * network: `authenticate` resolves the queued identity or rejects with the queued
 * error, defaulting to a verified Google identity. Mirrors FakeTransactionManager
 * in spirit — a tiny, controllable stand-in for the real provider.
 */
export class FakeGoogleIdentityProvider implements IGoogleIdentityProvider {
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

	async authenticate(_authorizationCode: string): Promise<VerifiedGoogleIdentity> {
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
 * constructing the provider directly. The exported setters let a test queue the
 * identity/error for the next Google request.
 */
export const fakeGoogleIdentityProvider = new FakeGoogleIdentityProvider();

export const setNextVerifiedGoogleIdentity = (identity: VerifiedGoogleIdentity): void =>
	fakeGoogleIdentityProvider.setNextIdentity(identity);

export const setNextGoogleIdentityError = (error: unknown): void => fakeGoogleIdentityProvider.setNextError(error);

export const resetFakeGoogleIdentityProvider = (): void => fakeGoogleIdentityProvider.reset();
