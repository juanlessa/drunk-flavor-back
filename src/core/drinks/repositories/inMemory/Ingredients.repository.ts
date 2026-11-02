import { randomUUID } from 'node:crypto';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class IngredientsRepositoryInMemory implements IIngredientsRepository {
	collection: Ingredient[] = [];

	async create(data: CreateIngredient): Promise<Ingredient> {
		const now = new Date();
		const record: Ingredient = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateIngredient): Promise<Ingredient> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const record = { ...deepUpdate<Ingredient>(data, this.collection[index]), updatedAt: new Date() };
		this.collection[index] = record;
		return record;
	}

	async delete(id: string): Promise<Ingredient> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findByName(translations: FindIngredientByName): Promise<Ingredient | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) ?? null;
	}

	async findById(id: string): Promise<Ingredient | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findByIdList(ids: string[]): Promise<Ingredient[]> {
		return this.collection.filter((record) => ids.includes(record.id));
	}

	async findAll(query: QueryParams): Promise<Ingredient[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ingredients.notFound', {
			path: 'IngredientsInMemory.repository',
			cause: `Ingredient missing during ${operation}`,
		});
	}
}
