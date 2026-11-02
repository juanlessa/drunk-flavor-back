import { ICredentialsRepository } from '@/core/accounts/repositories/ICredentials.repository';
import { Credential } from '@/core/accounts/entities/credential.entity';
import { CreateCredential, UpdateCredential } from '@/core/accounts/dtos/credential.dtos';
import { CREDENTIAL_USER_ID_UNIQUE_INDEX, CredentialModel, CredentialPersistence } from '../entities/credential.model';
import { CredentialMapper } from '../mappers/credential.mapper';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { CredentialAlreadyExistsError } from '@/core/accounts/errors/credential.errors';

export class CredentialsRepository implements ICredentialsRepository {
	private model = CredentialModel;

	async create(data: CreateCredential): Promise<Credential> {
		try {
			const document = await this.model.create(CredentialMapper.toPersistence(data));
			return CredentialMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, [CREDENTIAL_USER_ID_UNIQUE_INDEX])) {
				throw new CredentialAlreadyExistsError({ path: 'Credentials.repository' });
			}
			throw error;
		}
	}

	async update(data: UpdateCredential): Promise<void> {
		await this.model
			.updateOne(
				{ user_id: data.userId },
				{ $set: CredentialMapper.toPersistence(data) },
				{ runValidators: true },
			)
			.exec();
	}

	async existsByUserId(userId: string): Promise<boolean> {
		return (await this.model.exists({ user_id: userId })) !== null;
	}

	async findByUserId(userId: string): Promise<Credential | null> {
		const document = await this.model.findOne({ user_id: userId }).lean<CredentialPersistence>().exec();
		return document ? CredentialMapper.toDomain(document) : null;
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.model.deleteOne({ user_id: userId }).exec();
	}
}
