import { randomUUID } from 'node:crypto';
import {
	CreateRating,
	RatingListQuery,
	RatingSortField,
	RatingSummary,
	UpdateRating,
} from '@/core/engagement/dtos/rating.dtos';
import { Rating } from '@/core/engagement/entities/rating.entity';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';

const compareValues = (a: unknown, b: unknown): number => {
	if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
	if (typeof a === 'number' && typeof b === 'number') return a - b;
	return String(a).localeCompare(String(b));
};

const sortRatings = (records: Rating[], sort: RatingListQuery['sort']): Rating[] => {
	const entries = Object.entries(sort) as [RatingSortField, 1 | -1][];
	return [...records].sort((a, b) => {
		for (const [field, direction] of entries) {
			const comparison = compareValues(a[field], b[field]);
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
		if (this.collection.some((record) => record.drinkId === data.drinkId && record.userId === data.userId)) {
			throw new BadRequestError('apiResponses.ratings.alreadyExist', {
				path: 'RatingsInMemory.repository',
				cause: 'Duplicate (drinkId, userId) pair',
			});
		}
		const now = new Date();
		const record: Rating = { id: randomUUID(), ...data, createdAt: now, updatedAt: now };
		this.collection.push(record);
		return record;
	}

	async update({ id, value }: UpdateRating): Promise<Rating> {
		const record = this.collection.find((candidate) => candidate.id === id);
		if (!record) throw this.notFound('update');
		record.value = value;
		record.updatedAt = new Date();
		return record;
	}

	async delete(id: string): Promise<Rating> {
		const index = this.collection.findIndex((record) => record.id === id);
		if (index < 0) throw this.notFound('delete');
		return this.collection.splice(index, 1)[0];
	}

	async findById(id: string): Promise<Rating | null> {
		return this.collection.find((record) => record.id === id) ?? null;
	}

	async findAll(query: RatingListQuery): Promise<Rating[]> {
		return paginate(sortRatings(this.collection, query.sort), query);
	}

	async findByUser(userId: string, query: RatingListQuery): Promise<Rating[]> {
		return paginate(
			sortRatings(
				this.collection.filter((record) => record.userId === userId),
				query.sort,
			),
			query,
		);
	}

	async findByDrink(drinkId: string, query: RatingListQuery): Promise<Rating[]> {
		return paginate(
			sortRatings(
				this.collection.filter((record) => record.drinkId === drinkId),
				query.sort,
			),
			query,
		);
	}

	async findByDrinkAndUser(drinkId: string, userId: string): Promise<Rating | null> {
		return this.collection.find((record) => record.drinkId === drinkId && record.userId === userId) ?? null;
	}

	async summarizeByDrink(drinkId: string): Promise<RatingSummary> {
		const ratings = this.collection.filter((record) => record.drinkId === drinkId);
		if (ratings.length === 0) return { average: 0, count: 0 };
		return {
			average: ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length,
			count: ratings.length,
		};
	}

	async deleteByUser(userId: string): Promise<number> {
		return this.deleteMatching((record) => record.userId === userId);
	}

	async deleteByDrink(drinkId: string): Promise<number> {
		return this.deleteMatching((record) => record.drinkId === drinkId);
	}

	private deleteMatching(predicate: (record: Rating) => boolean): number {
		const initialLength = this.collection.length;
		this.collection = this.collection.filter((record) => !predicate(record));
		return initialLength - this.collection.length;
	}

	private notFound(operation: string): NotFoundError {
		return new NotFoundError('apiResponses.ratings.notFound', {
			path: 'RatingsInMemory.repository',
			cause: `Rating missing during ${operation}`,
		});
	}
}
