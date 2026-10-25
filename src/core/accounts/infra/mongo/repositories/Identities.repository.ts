import { IIdentitiesRepository } from '@/core/accounts/repositories/IIdentities.repository';
import { Identity, IdentityProvider } from '@/core/accounts/entities/identity.entity';
import { CreateIdentity } from '@/core/accounts/dtos/identity.dtos';
import { IDENTITY_UNIQUE_INDEXES, IdentityModel } from '../entities/identity.model';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class IdentitiesRepository implements IIdentitiesRepository {
	private model = IdentityModel;

	async create(data: CreateIdentity): Promise<Identity> {
		try {
			return await this.model.create(data);
		} catch (error) {
			throw mapDuplicateKeyError(error, IDENTITY_UNIQUE_INDEXES, 'apiResponses.users.alreadyExist', {
				path: 'Identities.repository',
			});
		}
	}

	async findByProviderSub(provider: IdentityProvider, providerSub: string): Promise<Identity | null> {
		return this.model
			.findOne<Identity>({ provider, provider_sub: providerSub })
			.lean<Identity>({ transform: removeLeanVersionKey })
			.exec();
	}

	async touchLastLogin(id: string, date: Date): Promise<void> {
		await this.model.updateOne({ _id: id }, { $set: { last_login_at: date } }).exec();
	}

	async findByUserId(userId: string): Promise<Identity[]> {
		return this.model
			.find<Identity>({ user_id: userId })
			.lean<Identity[]>({ transform: removeLeanVersionKey })
			.exec();
	}
}
