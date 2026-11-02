import { Identity } from '@/core/accounts/entities/identity.entity';
import { IdentityPersistence } from '../entities/identity.model';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { EntryMapper } from '@/infrastructure/mongo/types/mapper.types';

const IDENTITY_FIELD_TO_DOMAIN = {
	provider_sub: 'providerSubject',
	email_verified: 'isEmailVerified',
} as const;

const IDENTITY_FIELD_TO_PERSISTENCE = {
	providerSubject: 'provider_sub',
	isEmailVerified: 'email_verified',
} as const;

const toIdentityDomainEntry: EntryMapper = (key, value) => {
	const domainKey = IDENTITY_FIELD_TO_DOMAIN[key as keyof typeof IDENTITY_FIELD_TO_DOMAIN];
	return domainKey ? [domainKey, value] : toDomainEntry(key, value);
};

const toIdentityPersistenceEntry: EntryMapper = (key, value) => {
	const persistenceKey = IDENTITY_FIELD_TO_PERSISTENCE[key as keyof typeof IDENTITY_FIELD_TO_PERSISTENCE];
	return persistenceKey ? [persistenceKey, value] : toPersistenceEntry(key, value);
};

export const IdentityMapper = {
	toDomain(document: IdentityPersistence): Identity {
		return mapObjectEntriesDeep(toPlainObject(document), toIdentityDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Identity;
	},
	toPersistence(data: Partial<Identity>): Partial<IdentityPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toIdentityPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<IdentityPersistence>;
	},
	toObjectId,
};
