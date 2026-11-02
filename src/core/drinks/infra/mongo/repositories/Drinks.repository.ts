import { CreateDrink, FindDrinkByName, UpdateDrink } from '@/core/drinks/dtos/drink.dtos';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { buildQuery } from '@/infrastructure/mongo/helpers/query.helpers';
import { toMongoUpdateSet } from '@/infrastructure/mongo/helpers/mapper.helpers';
import { mapDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import type { ApplyRatingDelta, DrinkRatingSummary } from '@/core/drinks/public/IDrinksModule';
import { NotFoundError } from '@/shared/error/error.lib';
import { QueryParams } from '@/shared/types/query.types';
import { QueryFilter } from 'mongoose';
import { DRINK_UNIQUE_INDEXES, DrinkModel, DrinkPersistence } from '../entities/drink.model';
import { getNameCompareQuery } from '../helpers/translations.helpers';
import { DrinkMapper } from '../mappers/drink.mapper';

export class DrinksRepository implements IDrinksRepository {
	async create(data: CreateDrink): Promise<Drink> {
		try {
			const document = await DrinkModel.create(DrinkMapper.toPersistence(data));
			return DrinkMapper.toDomain(document);
		} catch (error) {
			throw mapDuplicateKeyError(error, DRINK_UNIQUE_INDEXES, 'apiResponses.drinks.alreadyExist', {
				path: 'Drinks.repository',
			});
		}
	}

	async update({ id, ...data }: UpdateDrink): Promise<Drink> {
		const objectId = DrinkMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		let document: DrinkPersistence | null;
		try {
			document = await DrinkModel.findByIdAndUpdate(
				objectId,
				{ $set: toMongoUpdateSet(DrinkMapper.toPersistence(data)) },
				{
					returnDocument: 'after',
					runValidators: true,
				},
			)
				.select('+ratings_sum')
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
		const document = await DrinkModel.findByIdAndDelete(objectId)
			.select('+ratings_sum')
			.lean<DrinkPersistence>()
			.exec();
		if (!document) throw this.notFound('delete');
		return DrinkMapper.toDomain(document);
	}

	async findByName(data: FindDrinkByName): Promise<Drink | null> {
		const document = await DrinkModel.findOne({ $or: getNameCompareQuery(data) })
			.select('+ratings_sum')
			.lean<DrinkPersistence>()
			.exec();
		return document ? DrinkMapper.toDomain(document) : null;
	}

	async findById(id: string): Promise<Drink | null> {
		const objectId = DrinkMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await DrinkModel.findById(objectId).select('+ratings_sum').lean<DrinkPersistence>().exec();
		return document ? DrinkMapper.toDomain(document) : null;
	}

	async findAll(query: QueryParams): Promise<Drink[]> {
		const documents = await buildQuery<DrinkPersistence>(DrinkMapper.toPersistenceQuery(query), DrinkModel)
			.select('+ratings_sum')
			.lean<DrinkPersistence[]>()
			.exec();
		return documents.map(DrinkMapper.toDomain);
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
					},
				},
			],
			{ returnDocument: 'after', updatePipeline: true },
		)
			.select('+ratings_sum')
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
