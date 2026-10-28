import { randomUUID } from 'node:crypto';
import { Credential } from '@/core/accounts/entities/credential.entity';
import { CreateCredential, UpdateCredential } from '@/core/accounts/dtos/credential.dtos';
import { CredentialAlreadyExistsError } from '@/core/accounts/errors/credential.errors';
import { ICredentialsRepository } from '../ICredentials.repository';

export class CredentialsRepositoryInMemory implements ICredentialsRepository {
	collection: Credential[] = [];

	async create(data: CreateCredential): Promise<Credential> {
		if (this.collection.some((record) => record.userId === data.userId)) {
			throw new CredentialAlreadyExistsError({ path: 'CredentialsRepositoryInMemory.create' });
		}
		const now = new Date();
		const record: Credential = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ userId, passwordHash }: UpdateCredential): Promise<void> {
		const record = this.collection.find((credential) => credential.userId === userId);
		if (!record) {
			return;
		}
		record.passwordHash = passwordHash;
		record.updatedAt = new Date();
	}

	async existsByUserId(userId: string): Promise<boolean> {
		return this.collection.some((record) => record.userId === userId);
	}

	async findByUserId(userId: string): Promise<Credential | null> {
		return this.collection.find((record) => record.userId === userId) ?? null;
	}

	async deleteByUserId(userId: string): Promise<void> {
		this.collection = this.collection.filter((record) => record.userId !== userId);
	}
}
