import { Unit } from '@/core/drinks/entities/unit.entity';
import { QueryParams } from '@/shared/types/query.types';
import { DeepPartial } from '@/shared/types/utility.types';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { UnitPersistence } from '../entities/unit.model';

export const UnitMapper = {
	toDomain(document: UnitPersistence): Unit {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, { nullHandling: 'toUndefined' }) as Unit;
	},
	toPersistence(data: DeepPartial<Unit>): Partial<UnitPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<UnitPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return { ...query, sort: mapQueryFields(query.sort), search: mapQueryFields(query.search) };
	},
};
