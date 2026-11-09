import { Drink } from '@/core/drinks/entities/drink.entity';
import { QueryParams } from '@/shared/types/query.types';
import { DeepPartial } from '@/shared/types/utility.types';
import {
	mapObjectEntriesDeep,
	mapQueryFields,
	mapSearchQueryFields,
	toDomainEntry,
	toObjectId,
	toPersistenceEntry,
	toPlainObject,
} from '@/infrastructure/mongo/helpers/mapper.helpers';
import { DrinkPersistence } from '../entities/drink.model';

/**
 * Fields that only the persistence layer knows. They never belong to the domain, whatever the query loaded: an
 * aggregation, unlike a `find`, returns the fields marked `select: false`.
 */
const PERSISTENCE_ONLY_FIELDS: ReadonlySet<string> = new Set([
	'ratings_sum',
	'rating_score',
	'search_keys',
	'required_ingredient_ids',
]);

export const DrinkMapper = {
	toDomain(document: DrinkPersistence): Drink {
		const fields = Object.fromEntries(
			Object.entries(toPlainObject(document)).filter(([field]) => !PERSISTENCE_ONLY_FIELDS.has(field)),
		);
		return mapObjectEntriesDeep(fields, toDomainEntry, { nullHandling: 'toUndefined' }) as Drink;
	},
	toPersistence(data: DeepPartial<Drink>): Partial<DrinkPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<DrinkPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return { ...query, sort: mapQueryFields(query.sort), search: mapSearchQueryFields(query.search) };
	},
};
