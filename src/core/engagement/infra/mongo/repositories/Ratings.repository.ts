import { CreateRating, RatingListQuery, UpdateRating } from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';
import { RATING_DRINK_USER_UNIQUE_INDEX, RatingModel } from '@/core/engagement/infra/mongo/entities/rating.model';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { removeLeanVersionKey } from '@/infrastructure/mongo/helpers/mongoose.helpers';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { QueryFilter } from 'mongoose';
import { MongoServerError } from 'mongodb';

const isRatingPairDuplicate = (error: unknown): error is MongoServerError =>
	error instanceof MongoServerError && error.code === 11000 && error.message.includes(RATING_DRINK_USER_UNIQUE_INDEX);

export class RatingsRepository implements IRatingsRepository {
	async create(data: CreateRating): Promise<Rating> {
		try {
			return await RatingModel.create(data);
		} catch (error) {
			if (isRatingPairDuplicate(error)) {
				throw new BadRequestError('apiResponses.ratings.alreadyExist', {
					path: 'Ratings.repository',
					cause: 'Unique (drink_id, user_id) index violation',
				});
			}
			throw error;
		}
	}

	async update({ id, value }: UpdateRating): Promise<Rating> {
		const rating = await RatingModel.findByIdAndUpdate<Rating>(
			id,
			{ $set: { value } },
			{ returnDocument: 'after', runValidators: true },
		).exec();
		if (!rating) {
			throw new NotFoundError('apiResponses.ratings.notFound', {
				path: 'Ratings.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		return rating;
	}

	async delete(id: string): Promise<Rating> {
		const rating = await RatingModel.findByIdAndDelete<Rating>(id).exec();
		if (!rating) {
			throw new NotFoundError('apiResponses.ratings.notFound', {
				path: 'Ratings.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		return rating;
	}

	async findById(id: string): Promise<Rating | null> {
		return RatingModel.findById<Rating>(id).lean<Rating>({ transform: removeLeanVersionKey }).exec();
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
		return RatingModel.findOne<Rating>({ drink_id: drinkId, user_id: userId })
			.lean<Rating>({ transform: removeLeanVersionKey })
			.exec();
	}

	async deleteByUser(userId: string): Promise<number> {
		const result = await RatingModel.deleteMany({ user_id: userId }).exec();
		return result.deletedCount;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const result = await RatingModel.deleteMany({ drink_id: drinkId }).exec();
		return result.deletedCount;
	}

	private runListQuery(filter: QueryFilter<Rating>, query: RatingListQuery): Promise<Rating[]> {
		const skip = (query.page - 1) * query.limit;
		return RatingModel.find(filter)
			.sort(query.sort)
			.skip(skip)
			.limit(query.limit)
			.lean<Rating[]>({ transform: removeLeanVersionKey })
			.exec();
	}
}
