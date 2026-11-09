import { randomUUID } from 'node:crypto';
import {
	CreateDrink,
	DrinkIngredientMatch,
	FindDrinkByName,
	FindDrinksByIngredients,
	UpdateDrink,
} from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import {
	NAME_SEARCH_FIELDS,
	buildTranslationsSearchKeys,
	createNameSearchMatchers,
} from '@/core/drinks/helpers/searchKeys.helpers';
import { getMissingIngredientIds, getRequiredIngredientIds } from '@/core/drinks/helpers/drinkMatch.helpers';
import { getRatingScore } from '@/core/drinks/helpers/ratingScore.helpers';
import { compareTranslationsName } from '@/core/drinks/helpers/translations.helpers';
import type { ApplyRatingDelta, DrinkRatingSummary } from '@/core/drinks/public/IDrinksModule';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { NotFoundError } from '@/shared/error/error.lib';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { filterItemsBySearchCriteria, paginateItems, sortItemsByFields } from '@/shared/helpers/query.helpers';
import { QueryParams } from '@/shared/types/query.types';

const searchMatchers = createNameSearchMatchers<Drink>((item) =>
	buildTranslationsSearchKeys(item.translations, NAME_SEARCH_FIELDS),
);

export class DrinksRepositoryInMemory implements IDrinksRepository {
	collection: Drink[] = [];
	/** The sum of the ratings of each drink. Like in the database, it is not part of the drink, only of its storage. */
	private ratingSums = new Map<string, number>();

	async create(data: CreateDrink): Promise<Drink> {
		const now = new Date();
		const record: Drink = {
			id: randomUUID(),
			...data,
			garnishes: data.garnishes ?? [],
			cover: undefined,
			thumbnail: undefined,
			avgRating: 0,
			ratingsCount: 0,
			createdAt: now,
			updatedAt: now,
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, preparation, ...data }: UpdateDrink): Promise<Drink> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('update');
		const { preparation: currentPreparation, ...current } = this.collection[index];
		const nextPreparation = preparation === undefined ? currentPreparation : (preparation ?? undefined);
		const record: Drink = {
			...deepUpdate<Drink>(data, current as Drink),
			...(nextPreparation ? { preparation: nextPreparation } : {}),
			updatedAt: new Date(),
		};
		this.collection[index] = record;
		return record;
	}

	async delete(id: string): Promise<Drink> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		const [removed] = this.collection.splice(index, 1);
		this.ratingSums.delete(id);
		return removed;
	}

	async findByName(translations: FindDrinkByName): Promise<Drink | null> {
		return this.collection.find((record) => compareTranslationsName(record.translations, translations)) ?? null;
	}

	async findById(id: string): Promise<Drink | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		let found = [...this.collection];
		if (query.search) found = filterItemsBySearchCriteria(found, query.search, searchMatchers);
		if (query.sort) found = this.sort(found, query.sort);
		return paginateItems(found, query.limit || DEFAULT_QUERY_PARAMS.limit, query.page || DEFAULT_QUERY_PARAMS.page);
	}

	async findByIngredients({
		ingredientIds,
		maxMissing,
		limit = DEFAULT_QUERY_PARAMS.limit,
		page = DEFAULT_QUERY_PARAMS.page,
	}: FindDrinksByIngredients): Promise<DrinkIngredientMatch[]> {
		const available = new Set(ingredientIds);
		const matches = this.collection
			.map((drink, position) => ({ drink, position, required: getRequiredIngredientIds(drink.ingredients) }))
			// At least one required ingredient must be one the person has, whatever `maxMissing` is.
			.filter(({ required }) => required.some((id) => available.has(id)))
			.map(({ required, ...match }) => ({
				...match,
				missingIngredientIds: getMissingIngredientIds(required, available),
			}))
			.filter(({ missingIngredientIds }) => maxMissing === 'any' || missingIngredientIds.length <= maxMissing)
			// The most complete first, then the best rated, then the newest (the last one stored).
			.sort(
				(a, b) =>
					a.missingIngredientIds.length - b.missingIngredientIds.length ||
					this.ratingScoreOf(b.drink) - this.ratingScoreOf(a.drink) ||
					b.position - a.position,
			)
			.map(({ drink, missingIngredientIds }) => ({
				drink,
				missingIngredientIds: [...missingIngredientIds].sort(),
			}));
		return paginateItems(matches, limit, page);
	}

	async applyRatingDelta({ drinkId, countDelta, sumDelta }: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		const record = this.collection.find((drink) => drink.id === drinkId);
		if (!record) throw this.notFound('rating projection update');
		const ratingsCount = record.ratingsCount + countDelta;
		const ratingsSum = (this.ratingSums.get(drinkId) ?? 0) + sumDelta;
		if (ratingsCount < 0 || ratingsSum < 0) throw new Error('Rating projection invariant violated');
		record.ratingsCount = ratingsCount;
		this.ratingSums.set(drinkId, ratingsSum);
		record.avgRating = ratingsCount === 0 ? 0 : ratingsSum / ratingsCount;
		record.updatedAt = new Date();
		return { average: record.avgRating, count: record.ratingsCount };
	}

	/**
	 * Sorts the drinks by the given fields. `ratingScore` is not a field of the drink, like in the database: it is
	 * worked out from the sum of the ratings the repository keeps.
	 */
	private sort(drinks: Drink[], sort: NonNullable<QueryParams['sort']>): Drink[] {
		const fields = Object.fromEntries(
			Object.entries(sort).map(([field, order]) => [field === 'ratingScore' ? field : `drink.${field}`, order]),
		);
		const scored = drinks.map((drink) => ({
			drink,
			ratingScore: this.ratingScoreOf(drink),
		}));
		return sortItemsByFields(scored, fields).map(({ drink }) => drink);
	}

	private ratingScoreOf(drink: Drink): number {
		return getRatingScore(this.ratingSums.get(drink.id) ?? 0, drink.ratingsCount);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.drinks.notFound', {
			path: 'DrinksInMemory.repository',
			cause: `Drink missing during ${operation}`,
		});
	}
}
