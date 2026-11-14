import { randomUUID } from 'node:crypto';
import { clearCreatorFromRecords, keepCreator, prioritizeCreator } from '@/core/drinks/helpers/creator.helpers';
import { CreateIngredient, FindIngredientByName, UpdateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { IngredientKinds } from '@/core/drinks/constants/ingredient.constants';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import {
	INGREDIENT_SEARCH_FIELDS,
	INGREDIENT_SEARCH_OPTIONS,
	buildTranslationsSearchKeys,
	createNameSearchMatchers,
} from '@/core/drinks/helpers/searchKeys.helpers';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { Languages, Language } from '@/core/drinks/types/translations';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

const searchMatchers = createNameSearchMatchers<Ingredient>((item) =>
	buildTranslationsSearchKeys(item.translations, INGREDIENT_SEARCH_FIELDS, [item.brand], INGREDIENT_SEARCH_OPTIONS),
);

export class IngredientsRepositoryInMemory implements IIngredientsRepository {
	collection: Ingredient[] = [];

	async create(data: CreateIngredient): Promise<Ingredient> {
		const now = new Date();
		const record: Ingredient = {
			id: randomUUID(),
			...data,
			updatedBy: data.createdBy,
			kind: data.kind ?? IngredientKinds.generic,
			createdAt: now,
			updatedAt: now,
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, brand, translations, kind, ...data }: UpdateIngredient): Promise<Ingredient> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const current = this.collection[index];
		const record: Ingredient = {
			...deepUpdate<Ingredient>(data, current),
			translations: this.mergeTranslations(current.translations, translations),
			kind: kind ?? current.kind,
			updatedAt: new Date(),
		};
		if (brand === null) delete record.brand;
		else if (brand !== undefined) record.brand = brand;
		const stored = keepCreator(record, this.collection[index]);
		this.collection[index] = stored;
		return stored;
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

	async findAll(query: QueryParams, onlyIds?: string[]): Promise<Ingredient[]> {
		let found = onlyIds ? this.collection.filter(({ id }) => onlyIds.includes(id)) : [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search, searchMatchers);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	async findAllOwnedFirst(query: QueryParams, userId: string): Promise<Ingredient[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search, searchMatchers);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		found = prioritizeCreator(found, userId);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	/** Applies the translations patch per language; a `null` description or plural name removes the current one. */
	private mergeTranslations(
		current: Ingredient['translations'],
		patch: UpdateIngredient['translations'],
	): Ingredient['translations'] {
		const languages = Object.keys(Languages) as Language[];
		return languages.reduce<Ingredient['translations']>(
			(merged, language) => {
				const { description, namePlural, ...fields } = patch?.[language] ?? {};
				const translation = { ...current[language], ...fields };
				if (description === null) delete translation.description;
				else if (description !== undefined) translation.description = description;
				if (namePlural === null) delete translation.namePlural;
				else if (namePlural !== undefined) translation.namePlural = namePlural;
				return { ...merged, [language]: translation };
			},
			{} as Ingredient['translations'],
		);
	}

	async clearCreatorByUser(userId: string): Promise<number> {
		return clearCreatorFromRecords(this.collection, userId);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ingredients.notFound', {
			path: 'IngredientsInMemory.repository',
			cause: `Ingredient missing during ${operation}`,
		});
	}
}
