import { CreateRating, RatingListQuery, RatingSummary, UpdateRating } from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';
import {
	RATING_DRINK_USER_UNIQUE_INDEX,
	RatingModel,
	RatingPersistence,
} from '@/core/engagement/infra/mongo/entities/rating.model';
import { RatingMapper } from '@/core/engagement/infra/mongo/mappers/rating.mapper';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { isDuplicateKeyError } from '@/infrastructure/mongo/helpers/duplicateKey.helpers';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { QueryFilter } from 'mongoose';

export class RatingsRepository implements IRatingsRepository {
	async create(data: CreateRating): Promise<Rating> {
		try {
			const document = await RatingModel.create(RatingMapper.toPersistence(data));
			return RatingMapper.toDomain(document);
		} catch (error) {
			if (isDuplicateKeyError(error, [RATING_DRINK_USER_UNIQUE_INDEX])) {
				throw new BadRequestError('apiResponses.ratings.alreadyExist', {
					path: 'Ratings.repository',
					cause: 'Unique (drink_id, user_id) index violation',
				});
			}
			throw error;
		}
	}

	async update({ id, value }: UpdateRating): Promise<Rating> {
		const objectId = RatingMapper.toObjectId(id);
		if (!objectId) throw this.notFound('update');
		const document = await RatingModel.findByIdAndUpdate(
			objectId,
			{ $set: { value } },
			{ returnDocument: 'after', runValidators: true },
		)
			.lean<RatingPersistence>()
			.exec();
		if (!document) throw this.notFound('update');
		return RatingMapper.toDomain(document);
	}

	async delete(id: string): Promise<Rating> {
		const objectId = RatingMapper.toObjectId(id);
		if (!objectId) throw this.notFound('delete');
		const document = await RatingModel.findByIdAndDelete(objectId).lean<RatingPersistence>().exec();
		if (!document) throw this.notFound('delete');
		return RatingMapper.toDomain(document);
	}

	async findById(id: string): Promise<Rating | null> {
		const objectId = RatingMapper.toObjectId(id);
		if (!objectId) return null;
		const document = await RatingModel.findById(objectId).lean<RatingPersistence>().exec();
		return document ? RatingMapper.toDomain(document) : null;
	}

	async findAll(query: RatingListQuery): Promise<Rating[]> {
		return this.runListQuery({}, query);
	}

	async findByUser(userId: string, query: RatingListQuery): Promise<Rating[]> {
		return this.runListQuery({ user_id: userId }, query);
	}

	async findByDrink(drinkId: string, query: RatingListQuery): Promise<Rating[]> {
		return this.runListQuery({ drink_id: drinkId }, query);
	}

	async findByDrinkAndUser(drinkId: string, userId: string): Promise<Rating | null> {
		const document = await RatingModel.findOne({ drink_id: drinkId, user_id: userId })
			.lean<RatingPersistence>()
			.exec();
		return document ? RatingMapper.toDomain(document) : null;
	}

	async summarizeByDrink(drinkId: string): Promise<RatingSummary> {
		const [summary] = await RatingModel.aggregate<{ _id: null; average: number; count: number }>([
			{ $match: { drink_id: drinkId } },
			{ $group: { _id: null, average: { $avg: '$value' }, count: { $sum: 1 } } },
		]).exec();
		return { average: summary?.average ?? 0, count: summary?.count ?? 0 };
	}

	async deleteByUser(userId: string): Promise<number> {
		const result = await RatingModel.deleteMany({ user_id: userId }).exec();
		return result.deletedCount;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const result = await RatingModel.deleteMany({ drink_id: drinkId }).exec();
		return result.deletedCount;
	}

	private async runListQuery(filter: QueryFilter<RatingPersistence>, query: RatingListQuery): Promise<Rating[]> {
		const documents = await RatingModel.find(filter)
			.sort(RatingMapper.toPersistenceSort(query.sort))
			.skip((query.page - 1) * query.limit)
			.limit(query.limit)
			.lean<RatingPersistence[]>()
			.exec();
		return documents.map(RatingMapper.toDomain);
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ratings.notFound', {
			path: 'Ratings.repository',
			cause: `Rating missing during ${operation}`,
		});
	}
}
