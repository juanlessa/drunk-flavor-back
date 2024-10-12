import { compare, hash } from 'bcrypt';
import { IHashProvider } from '../IHash.provider';

export class BcryptHashProvider implements IHashProvider {
	async hash(password: string): Promise<string> {
		const passwordHash = await hash(password, 8);
		return passwordHash;
	}

	async compare(password: string, hashedPassword: string): Promise<boolean> {
		const passwordMatch = await compare(password, hashedPassword);
		return passwordMatch;
	}
}
