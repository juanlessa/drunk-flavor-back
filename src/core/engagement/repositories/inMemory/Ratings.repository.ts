import { CreateRating, RatingListQuery, RatingSortField, UpdateRating } from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';

const compareValues = (a: unknown, b: unknown): number => {
	if (a instanceof Date && b instanceof Date) {
		return a.getTime() - b.getTime();
	}
	if (typeof a === 'number' && typeof b === 'number') {
		return a - b;
	}
	const aStr = String(a);
	const bStr = String(b);
	if (aStr < bStr) return -1;
	if (aStr > bStr) return 1;
	return 0;
};

const getSortableValue = (record: Rating, field: RatingSortField): unknown => {
	if (field === '_id') return record._id.toString();
	return record[field];
};

const sortRatings = (records: Rating[], sort: RatingListQuery['sort']): Rating[] => {
	const entries = Object.entries(sort) as [RatingSortField, 1 | -1][];
	return [...records].sort((a, b) => {
		for (const [field, direction] of entries) {
			const comparison = compareValues(getSortableValue(a, field), getSortableValue(b, field));
			if (comparison !== 0) return comparison * direction;
		}
		return 0;
	});
};

const paginate = (records: Rating[], query: RatingListQuery): Rating[] => {
	const start = (query.page - 1) * query.limit;
	return records.slice(start, start + query.limit);
};

export class RatingsRepositoryInMemory implements IRatingsRepository {
	collection: Rating[] = [];

	async create(data: CreateRating): Promise<Rating> {
		const duplicate = this.collection.find(
			(record) => record.drink_id === data.drink_id && record.user_id === data.user_id,
		);
		if (duplicate) {
			throw new BadRequestError('apiResponses.ratings.alreadyExist', {
				path: 'RatingsInMemory.repository',
				cause: 'Duplicate (drink_id, user_id) pair',
			});
		}

		const record: Rating = {
			_id: new ObjectId(),
			drink_id: data.drink_id,
			user_id: data.user_id,
			value: data.value,
			created_at: new Date(),
			updated_at: new Date(),
		};
		this.collection.push(record);
		return record;
	}

	async update({ id, value }: UpdateRating): Promise<Rating> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.ratings.notFound', {
				path: 'RatingsInMemory.repository',
				cause: 'Error on findByIdAndUpdate operation',
			});
		}
		const record = this.collection[recordIndex];
		record.value = value;
		record.updated_at = new Date();
		this.collection[recordIndex] = record;
		return record;
	}

	async delete(id: string): Promise<Rating> {
		const recordIndex = this.collection.findIndex((record) => record._id.toString() === id);
		if (recordIndex === -1) {
			throw new NotFoundError('apiResponses.ratings.notFound', {
				path: 'RatingsInMemory.repository',
				cause: 'Error on findByIdAndDelete operation',
			});
		}
		const [deletedRecord] = this.collection.splice(recordIndex, 1);
		return deletedRecord;
	}

	async findById(id: string): Promise<Rating | null> {
		return this.collection.find((record) => record._id.toString() === id) ?? null;
	}

	async findAll(query: RatingListQuery): Promise<Rating[]> {
		return paginate(sortRatings(this.collection, query.sort), query);
	}

	async findByUser(userId: string, query: RatingListQuery): Promise<Rating[]> {
		const found = this.collection.filter((record) => record.user_id === userId);
		return paginate(sortRatings(found, query.sort), query);
	}

	async findByDrink(drinkId: string, query: RatingListQuery): Promise<Rating[]> {
		const found = this.collection.filter((record) => record.drink_id === drinkId);
		return paginate(sortRatings(found, query.sort), query);
	}

	async findByDrinkAndUser(drinkId: string, userId: string): Promise<Rating | null> {
		return this.collection.find((record) => record.drink_id === drinkId && record.user_id === userId) ?? null;
	}

	async deleteByUser(userId: string): Promise<number> {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => record.user_id !== userId);
		return initialLength - this.collection.length;
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => record.drink_id !== drinkId);
		return initialLength - this.collection.length;
	}
}
