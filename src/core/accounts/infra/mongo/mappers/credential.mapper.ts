import { Credential } from '@/core/accounts/entities/credential.entity';
import { CredentialPersistence } from '../entities/credential.model';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';

export const CredentialMapper = {
	toDomain(document: CredentialPersistence): Credential {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Credential;
	},
	toPersistence(data: Partial<Credential>): Partial<CredentialPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<CredentialPersistence>;
	},
	toObjectId,
};
