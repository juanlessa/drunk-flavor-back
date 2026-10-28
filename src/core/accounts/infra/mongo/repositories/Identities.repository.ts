import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { CreateIdentity } from '@/core/accounts/dtos/identity.dtos';
import {
	IdentityProviderSubjectAlreadyExistsError,
	IdentityUserProviderAlreadyExistsError,
} from '@/core/accounts/errors/identity.errors';
import {
	IDENTITY_PROVIDER_SUB_UNIQUE_INDEX,
	IDENTITY_USER_PROVIDER_UNIQUE_INDEX,
	IdentityModel,
	IdentityPersistence,
} from '../entities/identity.model';
import { IdentityMapper } from '../mappers/identity.mapper';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';

export class IdentitiesRepository implements IIdentitiesRepository {
	private model = IdentityModel;

	async create(data: CreateIdentity): Promise<Identity> {
		try {
			const document = await this.model.create(IdentityMapper.toPersistence(data));
			return IdentityMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, [IDENTITY_PROVIDER_SUB_UNIQUE_INDEX])) {
				throw new IdentityProviderSubjectAlreadyExistsError({ path: 'Identities.repository' });
			}
			if (isDuplicateKeyError(error, [IDENTITY_USER_PROVIDER_UNIQUE_INDEX])) {
				throw new IdentityUserProviderAlreadyExistsError({ path: 'Identities.repository' });
			}
			throw error;
		}
	}

	async findByProviderSub(provider: IdentityProvider, providerSubject: string): Promise<Identity | null> {
		const document = await this.model
			.findOne({ provider, provider_sub: providerSubject })
			.lean<IdentityPersistence>()
			.exec();
		return document ? IdentityMapper.toDomain(document) : null;
	}

	async listProvidersByUserId(userId: string): Promise<IdentityProvider[]> {
		const records = await this.model.find({ user_id: userId }, { provider: 1, _id: 0 }).lean().exec();
		return records.map((record) => record.provider);
	}

	async touchLastLogin(id: string, date: Date): Promise<void> {
		const objectId = IdentityMapper.toObjectId(id);
		if (!objectId) {
			return;
		}
		await this.model
			.updateOne(
				{ _id: objectId },
				{ $set: IdentityMapper.toPersistence({ lastLoginAt: date }) },
				{
					runValidators: true,
				},
			)
			.exec();
	}

	async findByUserId(userId: string): Promise<Identity[]> {
		const documents = await this.model.find({ user_id: userId }).lean<IdentityPersistence[]>().exec();
		return documents.map((document) => IdentityMapper.toDomain(document));
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.model.deleteMany({ user_id: userId }).exec();
	}
}
