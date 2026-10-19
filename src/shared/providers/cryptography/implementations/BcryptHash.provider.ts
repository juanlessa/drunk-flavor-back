import { compare, hash } from 'bcrypt';
import { IHashProvider } from '../IHash.provider';
import { parseAuthEnv } from '@/env/auth';

const auth = parseAuthEnv();

export class BcryptHashProvider implements IHashProvider {
	private dummyHash?: string;

	async hash(password: string): Promise<string> {
		const passwordHash = await hash(password, auth.PASSWORD_HASH_ROUNDS);
		return passwordHash;
	}

	async compare(password: string, hashedPassword: string): Promise<boolean> {
		const passwordMatch = await compare(password, hashedPassword);
		return passwordMatch;
	}

	async getDummyHash(): Promise<string> {
		if (this.dummyHash === undefined) {
			this.dummyHash = await this.hash(auth.DUMMY_PASSWORD);
		}
		return this.dummyHash;
	}
}
