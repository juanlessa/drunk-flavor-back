import { env } from '@/env';
import { IGoogleTokenVerifier } from './IGoogleTokenVerifier';
import { GoogleAuthLibraryVerifier } from './implementations/GoogleAuthLibraryVerifier';
import { fakeGoogleTokenVerifier } from './fakes/FakeGoogleTokenVerifier';

// Pick the implementation by NODE_ENV, mirroring how
// src/shared/providers/cryptography/index.ts resolves implementations as module
// singletons. Tests (testing/e2e) use the fake so they never perform a real
// Google network call; development/production use the real library-backed
// verifier. The ternary short-circuits construction of the real client in
// test environments.
const verifier: IGoogleTokenVerifier =
	env.NODE_ENV === 'testing' || env.NODE_ENV === 'e2e' ? fakeGoogleTokenVerifier : new GoogleAuthLibraryVerifier();

export const resolveGoogleTokenVerifier = () => verifier;

export {
	fakeGoogleTokenVerifier,
	setNextGoogleTokenPayload,
	setNextGoogleTokenError,
	resetFakeGoogleTokenVerifier,
} from './fakes/FakeGoogleTokenVerifier';
