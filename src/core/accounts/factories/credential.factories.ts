import { CreateCredential } from '../dtos/credential.dtos';

export const createCredentialFactory = (credential?: Partial<CreateCredential>): CreateCredential => ({
	userId: credential?.userId || '000000000000000000000000',
	passwordHash: credential?.passwordHash || 'hashed-Password-12345678',
});
