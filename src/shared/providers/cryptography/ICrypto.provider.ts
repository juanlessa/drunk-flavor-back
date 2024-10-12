export interface ICryptoProvider {
	generateToken(length: number): Promise<string>;
}
