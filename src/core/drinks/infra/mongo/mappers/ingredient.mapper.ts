import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
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
import { IngredientPersistence } from '../entities/ingredient.model';

export const IngredientMapper = {
	toDomain(document: IngredientPersistence): Ingredient {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Ingredient;
	},
	toPersistence(data: DeepPartial<Ingredient>): Partial<IngredientPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<IngredientPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return { ...query, sort: mapQueryFields(query.sort), search: mapQueryFields(query.search) };
	},
};
