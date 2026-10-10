import { compare, hash } from 'bcrypt';
import { IHashProvider } from '../IHash.provider';
import { parseAuthEnv } from '@/env/auth';

const auth = parseAuthEnv();

export class BcryptHashProvider implements IHashProvider {
	async hash(password: string): Promise<string> {
		const passwordHash = await hash(password, auth.PASSWORD_HASH_ROUNDS);
		return passwordHash;
	}

	async compare(password: string, hashedPassword: string): Promise<boolean> {
		const passwordMatch = await compare(password, hashedPassword);
		return passwordMatch;
	}
}
