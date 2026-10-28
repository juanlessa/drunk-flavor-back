import { VerifiedGoogleIdentity } from './googleAuth.dtos';

export interface IGoogleTokenVerifier {
	verify(idToken: string): Promise<VerifiedGoogleIdentity>;
}
