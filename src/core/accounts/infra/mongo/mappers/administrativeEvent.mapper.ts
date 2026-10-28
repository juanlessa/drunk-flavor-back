import { AdministrativeEvent } from '@/core/accounts/entities/administrativeEvent.entity';
import { AdministrativeEventPersistence } from '../entities/administrativeEvent.model';
import {
	mapObjectEntriesDeep,
	toDomainEntry,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';

export const AdministrativeEventMapper = {
	toDomain(document: AdministrativeEventPersistence): AdministrativeEvent {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as AdministrativeEvent;
	},
	toPersistence(data: Partial<AdministrativeEvent>): Partial<AdministrativeEventPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<AdministrativeEventPersistence>;
	},
};
