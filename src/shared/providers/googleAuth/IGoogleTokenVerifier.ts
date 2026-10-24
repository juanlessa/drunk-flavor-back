export type GoogleTokenPayload = {
	sub: string;
	email?: string;
	email_verified?: boolean;
	given_name?: string;
	family_name?: string;
	picture?: string;
};

export interface IGoogleTokenVerifier {
	verify(idToken: string): Promise<GoogleTokenPayload>;
}
