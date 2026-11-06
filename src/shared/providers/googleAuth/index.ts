import { env } from '@/env';
import { IGoogleIdentityProvider } from './IGoogleIdentityProvider';
import { GoogleAuthLibraryIdentityProvider } from './implementations/GoogleAuthLibraryIdentityProvider';
import { fakeGoogleIdentityProvider } from './fakes/FakeGoogleIdentityProvider';

const provider: IGoogleIdentityProvider =
	env.NODE_ENV === 'testing' ? fakeGoogleIdentityProvider : new GoogleAuthLibraryIdentityProvider();

export const resolveGoogleIdentityProvider = () => provider;

export {
	setNextVerifiedGoogleIdentity,
	setNextGoogleIdentityError,
	resetFakeGoogleIdentityProvider,
} from './fakes/FakeGoogleIdentityProvider';
