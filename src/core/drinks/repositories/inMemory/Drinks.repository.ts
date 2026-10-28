import { randomUUID } from 'node:crypto';
import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import type { ApplyRatingDelta, DrinkRatingSummary } from '@/core/drinks/public/IDrinksModule';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

export class DrinksRepositoryInMemory implements IDrinksRepository {
	collection: Drink[] = [];

	async create(data: CreateDrink): Promise<Drink> {
		const now = new Date();
		const record: Drink = {
			id: randomUUID(),
			...data,
			cover: undefined,
			thumbnail: undefined,
			avgRating: 0,
			ratingsCount: 0,
			ratingsSum: 0,
			createdAt: now,
			updatedAt: now,
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const record = { ...deepUpdate<Drink>(data, this.collection[index]), updatedAt: new Date() };
		this.collection[index] = record;
		return record;
	}

	async delete(id: string): Promise<Drink> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findByName(translations: FindDrinkByName): Promise<Drink | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) ?? null;
	}

	async findById(id: string): Promise<Drink | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search);
		if (query.sort) found = sortItemsByFields(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	async applyRatingDelta({ drinkId, countDelta, sumDelta }: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		const record = this.collection.find((drink) => drink.id === drinkId);
		if (!record) throw this.notFound('rating projection update');
		const ratingsCount = record.ratingsCount + countDelta;
		const ratingsSum = record.ratingsSum + sumDelta;
		if (ratingsCount < 0 || ratingsSum < 0) throw new Error('Rating projection invariant violated');
		record.ratingsCount = ratingsCount;
		record.ratingsSum = ratingsSum;
		record.avgRating = ratingsCount === 0 ? 0 : ratingsSum / ratingsCount;
		record.updatedAt = new Date();
		return { average: record.avgRating, count: record.ratingsCount };
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.drinks.notFound', {
			path: 'DrinksInMemory.repository',
			cause: `Drink missing during ${operation}`,
		});
	}
}
