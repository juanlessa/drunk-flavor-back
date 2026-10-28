export type VerifiedGoogleIdentity = {
	subject: string;
	email?: string;
	isEmailVerified: boolean;
	givenName?: string;
	familyName?: string;
	pictureUrl?: string;
	issuedAt?: Date;
};
