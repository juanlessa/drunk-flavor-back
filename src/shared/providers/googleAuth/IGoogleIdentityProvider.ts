import { VerifiedGoogleIdentity } from './googleAuth.dtos';

export interface IGoogleIdentityProvider {
	/**
	 * Exchanges an authorization code from the Google popup (GIS code model) and returns the identity carried by the
	 * verified ID token of that exchange.
	 */
	authenticate(authorizationCode: string): Promise<VerifiedGoogleIdentity>;
}
