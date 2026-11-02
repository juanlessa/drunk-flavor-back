import { randomUUID } from 'node:crypto';
import { CreateCategory, FindCategoryByName, UpdateCategory } from '@/core/drinks/dtos/category.dtos';
import { Category } from '@/core/drinks/entities/category.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class CategoriesRepositoryInMemory implements ICategoriesRepository {
	collection: Category[] = [];

	async create(data: CreateCategory): Promise<Category> {
		const now = new Date();
		const record: Category = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateCategory): Promise<Category> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const record = { ...deepUpdate<Category>(data, this.collection[index]), updatedAt: new Date() };
		this.collection[index] = record;
		return record;
	}

	async delete(id: string): Promise<Category> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findByName(translations: FindCategoryByName): Promise<Category | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) ?? null;
	}

	async findById(id: string): Promise<Category | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: QueryParams): Promise<Category[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.categories.notFound', {
			path: 'CategoriesInMemory.repository',
			cause: `Category missing during ${operation}`,
		});
	}
}
