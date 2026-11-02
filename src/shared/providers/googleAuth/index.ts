import { env } from '@/env';
import { IGoogleTokenVerifier } from './IGoogleTokenVerifier';
import { GoogleAuthLibraryVerifier } from './implementations/GoogleAuthLibraryVerifier';
import { fakeGoogleTokenVerifier } from './fakes/FakeGoogleTokenVerifier';

const verifier: IGoogleTokenVerifier =
	env.NODE_ENV === 'testing' || env.NODE_ENV === 'e2e' ? fakeGoogleTokenVerifier : new GoogleAuthLibraryVerifier();

export const resolveGoogleTokenVerifier = () => verifier;

export {
	setNextVerifiedGoogleIdentity,
	setNextGoogleTokenError,
	resetFakeGoogleTokenVerifier,
} from './fakes/FakeGoogleTokenVerifier';
