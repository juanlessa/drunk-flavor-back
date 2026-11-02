import { Drink } from '@/core/drinks/entities/drink.entity';
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
import { DrinkPersistence } from '../entities/drink.model';

export const DrinkMapper = {
	toDomain(document: DrinkPersistence): Drink {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, { nullHandling: 'toUndefined' }) as Drink;
	},
	toPersistence(data: DeepPartial<Drink>): Partial<DrinkPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<DrinkPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return { ...query, sort: mapQueryFields(query.sort), search: mapQueryFields(query.search) };
	},
};
