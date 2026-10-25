import { Credential } from '@/core/accounts/entities/credential.entity';
import { CreateCredential, UpdateCredential } from '@/core/accounts/dtos/credential.dtos';

export interface ICredentialsRepository {
	findByUserId(userId: string): Promise<Credential | null>;
	create(data: CreateCredential): Promise<Credential>;
	update(data: UpdateCredential): Promise<void>;
	deleteByUserId(userId: string): Promise<void>;
}
