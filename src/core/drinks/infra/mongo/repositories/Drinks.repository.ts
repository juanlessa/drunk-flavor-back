import {
	CreateDrink,
	DrinkIngredientMatch,
	FindDrinkByName,
	FindDrinksByIngredients,
	UpdateDrink,
} from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import type { ApplyRatingDelta, DrinkRatingSummary } from '@/core/drinks/public/IDrinksModule';
import { SEARCH_KEYS_FIELD } from '@/infrastructure/mongo/constants/search.constants';
import { NAME_SEARCH_FIELDS, buildTranslationsSearchKeys } from '@/core/drinks/helpers/searchKeys.helpers';
import { deepUpdate } from '@/shared/helpers/deepUpdate.helper';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { RATING_PRIOR_MEAN, RATING_PRIOR_WEIGHT } from '@/core/drinks/constants/drink.constants';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { PipelineStage, QueryFilter, Types } from 'mongoose';
import { DRINK_UNIQUE_INDEXES, DrinkModel, DrinkPersistence } from '../entities/drink.model';
import { getRequiredIngredientObjectIds } from '../helpers/drinkRequiredIngredients.helpers';
import { findByTranslatedName, getSortCollation } from '../helpers/translations.helpers';
import { DrinkMapper } from '../mappers/drink.mapper';

export class DrinksRepository implements IDrinksRepository {
	async create(data: CreateDrink): Promise<Drink> {
		try {
			const persistenceData = DrinkMapper.toPersistence(data);
			const document = await DrinkModel.create({
				...persistenceData,
				search_keys: buildTranslationsSearchKeys(persistenceData.translations, NAME_SEARCH_FIELDS),
				required_ingredient_ids: getRequiredIngredientObjectIds(persistenceData.ingredients ?? []),
			});
			return DrinkMapper.toDomain(document);
		} catch (error) {
			throw mapDuplicateKeyError(error, DRINK_UNIQUE_INDEXES, 'apiResponses.drinks.alreadyExist', {
				path: 'Drinks.repository',
			});
		}
	}

	async update({ id, preparation, ...data }: UpdateDrink): Promise<Drink> {
		const objectId = DrinkMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const persistenceData = DrinkMapper.toPersistence({ ...data, preparation: preparation ?? undefined });
		const update = toMongoUpdateSet(persistenceData);
		// The recipe is replaced as a whole, so the ids that the search by ingredients matches on follow it.
		if (persistenceData.ingredients) {
			update['required_ingredient_ids'] = getRequiredIngredientObjectIds(persistenceData.ingredients);
		}
		if (persistenceData.translations) {
			const current = await DrinkModel.findById(objectId)
				.select('translations')
				.lean<Pick<DrinkPersistence, 'translations'>>()
				.exec();
			if (!current) throw this.notFound('update');
			update[SEARCH_KEYS_FIELD] = buildTranslationsSearchKeys(
				deepUpdate(persistenceData.translations, current.translations),
				NAME_SEARCH_FIELDS,
			);
		}
		let document: DrinkPersistence | null;
		try {
			document = await DrinkModel.findByIdAndUpdate(
				objectId,
				// `null` removes the stored plan; a plan replaces it through the `$set` paths.
				preparation === null ? { $set: update, $unset: { preparation: '' } } : { $set: update },
				{
					returnDocument: 'after',
					runValidators: true,
				},
			)
				.lean<DrinkPersistence>()
				.exec();
		} catch (error) {
			throw mapDuplicateKeyError(error, DRINK_UNIQUE_INDEXES, 'apiResponses.drinks.alreadyExist', {
				path: 'Drinks.repository',
			});
		}
		if (!document) throw this.notFound('update');
		return DrinkMapper.toDomain(document);
	}

	async delete(id: string): Promise<Drink> {
		const objectId = DrinkMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await DrinkModel.findByIdAndDelete(objectId).lean<DrinkPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return DrinkMapper.toDomain(document);
	}

	async findByName(data: FindDrinkByName): Promise<Drink | null> {
		const document = await findByTranslatedName(data, (filter, collation) =>
			DrinkModel.findOne(filter).collation(collation).lean<DrinkPersistence>().exec(),
		);
		return document ? DrinkMapper.toDomain(document) : null;
	}

	async findById(id: string): Promise<Drink | null> {
		const objectId = DrinkMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await DrinkModel.findById(objectId).lean<DrinkPersistence>().exec();
		return document ? DrinkMapper.toDomain(document) : null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		const persistenceQuery = DrinkMapper.toPersistenceQuery(query);
		const documents = await buildQuery<DrinkPersistence>(persistenceQuery, DrinkModel, {
			collation: getSortCollation(persistenceQuery.sort),
		})
			.lean<DrinkPersistence[]>()
			.exec();
		return documents.map(DrinkMapper.toDomain);
	}

	async findByIngredients({
		ingredientIds,
		maxMissing,
		limit = DEFAULT_QUERY_PARAMS.limit,
		page = DEFAULT_QUERY_PARAMS.page,
	}: FindDrinksByIngredients): Promise<DrinkIngredientMatch[]> {
		const available = ingredientIds.map(DrinkMapper.toObjectId);
		const hasOnlyValidIds = available.every((id): id is Types.ObjectId => id !== null);
		if (available.length === 0 || !hasOnlyValidIds) return [];

		const pipeline: PipelineStage[] = [
			// At least one required ingredient must be one the person has. This is the step the index serves, and it
			// holds for every `maxMissing`, so a drink with nothing in common is never a candidate.
			{ $match: { required_ingredient_ids: { $in: available } } },
			{ $addFields: { missing_ingredient_ids: { $setDifference: ['$required_ingredient_ids', available] } } },
			{ $addFields: { missing_count: { $size: '$missing_ingredient_ids' } } },
			...(maxMissing === 'any' ? [] : [{ $match: { missing_count: { $lte: maxMissing } } }]),
			// The most complete first, then the best rated; `_id` keeps the pages stable.
			{ $sort: { missing_count: 1, avg_rating: -1, _id: -1 } },
			{ $skip: (page - 1) * limit },
			{ $limit: limit },
			{
				$project: {
					search_keys: 0,
					required_ingredient_ids: 0,
					ratings_sum: 0,
					rating_score: 0,
					missing_count: 0,
				},
			},
		];
		const documents = await DrinkModel.aggregate<DrinkPersistence & { missing_ingredient_ids: Types.ObjectId[] }>(
			pipeline,
		).exec();
		return documents.map(({ missing_ingredient_ids, ...document }) => ({
			drink: DrinkMapper.toDomain(document),
			missingIngredientIds: missing_ingredient_ids.map((id) => id.toHexString()).sort(),
		}));
	}

	async applyRatingDelta({ drinkId, countDelta, sumDelta }: ApplyRatingDelta): Promise<DrinkRatingSummary> {
		const filter: QueryFilter<DrinkPersistence> = { _id: drinkId };
		if (countDelta < 0) filter.ratings_count = { $gte: -countDelta };
		if (sumDelta < 0) filter.ratings_sum = { $gte: -sumDelta };

		const document = await DrinkModel.findOneAndUpdate(
			filter,
			[
				{
					$set: {
						ratings_sum: { $add: [{ $ifNull: ['$ratings_sum', 0] }, sumDelta] },
						ratings_count: { $add: [{ $ifNull: ['$ratings_count', 0] }, countDelta] },
					},
				},
				{
					$set: {
						avg_rating: {
							$cond: [{ $eq: ['$ratings_count', 0] }, 0, { $divide: ['$ratings_sum', '$ratings_count'] }],
						},
						// The same as `getRatingScore`, from the sum and the count just written.
						rating_score: {
							$divide: [
								{ $add: ['$ratings_sum', RATING_PRIOR_WEIGHT * RATING_PRIOR_MEAN] },
								{ $add: ['$ratings_count', RATING_PRIOR_WEIGHT] },
							],
						},
					},
				},
			],
			{ returnDocument: 'after', updatePipeline: true },
		)
			.lean<DrinkPersistence>()
			.exec();

		if (!document) throw this.notFound('rating projection update');
		return { average: document.avg_rating, count: document.ratings_count };
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.drinks.notFound', {
			path: 'Drinks.repository',
			cause: `Drink missing during ${operation}`,
		});
	}
}
