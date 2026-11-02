import { Credential } from '../entities/credential.entity';

export type CreateCredential = Pick<Credential, 'userId' | 'passwordHash'>;

export type UpdateCredential = Pick<Credential, 'userId' | 'passwordHash'>;
