import { GoogleTokenPayload } from './googleAuth.dtos';

export interface IGoogleTokenVerifier {
	verify(idToken: string): Promise<GoogleTokenPayload>;
}
