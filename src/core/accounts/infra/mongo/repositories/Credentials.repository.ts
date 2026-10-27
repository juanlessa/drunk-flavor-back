import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { Credential } from '@/core/accounts/entities/credential.entity';
import { CreateCredential, UpdateCredential } from '@/core/accounts/dtos/credential.dtos';
import { CREDENTIAL_USER_ID_UNIQUE_INDEX, CredentialModel } from '../entities/credential.model';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { CredentialAlreadyExistsError } from '@/core/accounts/errors/credential.errors';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';

export class CredentialsRepository implements ICredentialsRepository {
	private model = CredentialModel;

	async create(data: CreateCredential): Promise<Credential> {
		try {
			return await this.model.create(data);
		} catch (error) {
			if (isDuplicateKeyError(error, [CREDENTIAL_USER_ID_UNIQUE_INDEX])) {
				throw new CredentialAlreadyExistsError({ path: 'Credentials.repository' });
			}
			throw error;
		}
	}

	async update({ user_id, password_hash }: UpdateCredential): Promise<void> {
		await this.model.updateOne({ user_id }, { $set: { password_hash } }).exec();
	}

	async existsByUserId(userId: string): Promise<boolean> {
		return (await this.model.exists({ user_id: userId })) !== null;
	}

	async findByUserId(userId: string): Promise<Credential | null> {
		return this.model
			.findOne<Credential>({ user_id: userId })
			.lean<Credential>({ transform: removeLeanVersionKey })
			.exec();
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.model.deleteOne({ user_id: userId }).exec();
	}
}
