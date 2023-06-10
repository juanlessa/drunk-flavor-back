interface IEncryptionProvider {
	hash(password: string): Promise<string>;
	compare(password: string, encryptedPassword: string): Promise<boolean>;
}

export { IEncryptionProvider };
