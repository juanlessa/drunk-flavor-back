import { Category } from '@/core/drinks/entities/category.entity';
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
import { CategoryPersistence } from '../entities/category.model';

export const CategoryMapper = {
	toDomain(document: CategoryPersistence): Category {
		return mapObjectEntriesDeep(toPlainObject(document), toDomainEntry, {
			nullHandling: 'toUndefined',
		}) as Category;
	},
	toPersistence(data: DeepPartial<Category>): Partial<CategoryPersistence> {
		return mapObjectEntriesDeep(data as Record<string, unknown>, toPersistenceEntry, {
			nullHandling: 'omit',
		}) as Partial<CategoryPersistence>;
	},
	toObjectId,
	toPersistenceQuery(query: QueryParams): QueryParams {
		return { ...query, sort: mapQueryFields(query.sort), search: mapQueryFields(query.search) };
	},
};
