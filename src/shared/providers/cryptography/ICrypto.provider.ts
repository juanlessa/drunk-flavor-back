export interface ICryptoProvider {
	generateToken(length: number): Promise<string>;
	hashToken(token: string): string;
}
