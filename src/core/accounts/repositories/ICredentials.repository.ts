import { Credential } from '@/core/accounts/entities/credential.entity';

export interface ICredentialsRepository {
	findByUserId(userId: string): Promise<Credential | null>;
	create(data: { user_id: string; password_hash: string }): Promise<Credential>;
	update(data: { user_id: string; password_hash: string }): Promise<void>;
	deleteByUserId(userId: string): Promise<void>;
}
