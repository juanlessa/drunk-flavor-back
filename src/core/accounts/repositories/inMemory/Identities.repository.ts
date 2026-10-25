import { MongoServerError, ObjectId } from 'mongodb';
import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { CreateIdentity } from '@/core/accounts/dtos/identity.dtos';
import { IDENTITY_PROVIDER_SUB_UNIQUE_INDEX } from '@/core/accounts/infra/mongo/entities/identity.model';
import { IIdentitiesRepository } from '../IIdentities.repository';

export class IdentitiesRepositoryInMemory implements IIdentitiesRepository {
	collection: Identity[] = [];

	async create(data: CreateIdentity): Promise<Identity> {
		const duplicate = this.collection.find(
			(rec) => rec.provider === data.provider && rec.provider_sub === data.provider_sub,
		);
		if (duplicate) {
			// Mirror the real Mongo duplicate-key violation so isDuplicateKeyError recognizes it.
			const error = new MongoServerError({
				message: `E11000 duplicate key error collection: identities index: ${IDENTITY_PROVIDER_SUB_UNIQUE_INDEX}`,
			});
			error.code = 11000;
			throw error;
		}

		const record: Identity = {
			_id: new ObjectId(),
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async findByProviderSub(provider: IdentityProvider, providerSub: string): Promise<Identity | null> {
		const recordFound = this.collection.find(
			(rec) => rec.provider === provider && rec.provider_sub === providerSub,
		);
		return recordFound || null;
	}

	async touchLastLogin(id: string, date: Date): Promise<void> {
		const record = this.collection.find((rec) => rec._id.toString() === id);
		if (!record) {
			return;
		}
		record.last_login_at = date;
		record.updated_at = new Date();
	}

	async findByUserId(userId: string): Promise<Identity[]> {
		return this.collection.filter((rec) => rec.user_id === userId);
	}
}
