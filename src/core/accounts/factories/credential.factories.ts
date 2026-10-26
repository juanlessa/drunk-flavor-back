import { CreateCredential } from '../dtos/credential.dtos';

export const createCredentialFactory = (credential?: Partial<CreateCredential>): CreateCredential => ({
	user_id: credential?.user_id || '000000000000000000000000',
	password_hash: credential?.password_hash || 'hashed-Password-12345678',
});
