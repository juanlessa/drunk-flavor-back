import { randomUUID } from 'node:crypto';
import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { CreateIdentity } from '@/core/accounts/dtos/identity.dtos';
import {
	IdentityProviderSubjectAlreadyExistsError,
	IdentityUserProviderAlreadyExistsError,
} from '@/core/accounts/errors/identity.errors';
import { IIdentitiesRepository } from '../IIdentities.repository';

export class IdentitiesRepositoryInMemory implements IIdentitiesRepository {
	collection: Identity[] = [];

	async create(data: CreateIdentity): Promise<Identity> {
		if (
			this.collection.some(
				(record) => record.provider === data.provider && record.providerSubject === data.providerSubject,
			)
		) {
			throw new IdentityProviderSubjectAlreadyExistsError({ path: 'IdentitiesRepositoryInMemory.create' });
		}
		if (this.collection.some((record) => record.userId === data.userId && record.provider === data.provider)) {
			throw new IdentityUserProviderAlreadyExistsError({ path: 'IdentitiesRepositoryInMemory.create' });
		}

		const now = new Date();
		const record: Identity = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async findByProviderSub(provider: IdentityProvider, providerSubject: string): Promise<Identity | null> {
		return (
			this.collection.find(
				(record) => record.provider === provider && record.providerSubject === providerSubject,
			) ?? null
		);
	}

	async listProvidersByUserId(userId: string): Promise<IdentityProvider[]> {
		return this.collection.filter((record) => record.userId === userId).map((record) => record.provider);
	}

	async touchLastLogin(id: string, date: Date): Promise<void> {
		const record = this.collection.find((identity) => identity.id === id);
		if (!record) {
			return;
		}
		record.lastLoginAt = date;
		record.updatedAt = new Date();
	}

	async findByUserId(userId: string): Promise<Identity[]> {
		return this.collection.filter((record) => record.userId === userId);
	}

	async deleteByUserId(userId: string): Promise<void> {
		this.collection = this.collection.filter((record) => record.userId !== userId);
	}
}
