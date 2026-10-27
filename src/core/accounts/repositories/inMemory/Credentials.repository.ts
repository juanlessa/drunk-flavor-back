import { ObjectId } from 'mongodb';
import { Credential } from '@/core/accounts/entities/credential.entity';
import { CreateCredential, UpdateCredential } from '@/core/accounts/dtos/credential.dtos';
import { ConflictError } from '@/shared/error/error.lib';
import { ICredentialsRepository } from '../ICredentials.repository';

export class CredentialsRepositoryInMemory implements ICredentialsRepository {
	collection: Credential[] = [];

	async create({ user_id, password_hash }: CreateCredential): Promise<Credential> {
		if (this.collection.some((record) => record.user_id === user_id)) {
			throw new ConflictError('apiResponses.profile.passwordAlreadyConfigured', {
				path: 'Credentials.repository.inMemory',
			});
		}

		const record: Credential = {
			_id: new ObjectId(),
			user_id,
			password_hash,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ user_id, password_hash }: UpdateCredential): Promise<void> {
		const record = this.collection.find((rec) => rec.user_id === user_id);
		if (!record) {
			return;
		}
		record.password_hash = password_hash;
		record.updated_at = new Date();
	}

	async existsByUserId(userId: string): Promise<boolean> {
		return this.collection.some((record) => record.user_id === userId);
	}

	async findByUserId(userId: string): Promise<Credential | null> {
		const recordFound = this.collection.find((rec) => rec.user_id === userId);
		return recordFound || null;
	}

	async deleteByUserId(userId: string): Promise<void> {
		this.collection = this.collection.filter((rec) => rec.user_id !== userId);
	}
}
