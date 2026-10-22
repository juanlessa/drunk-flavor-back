import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';

const query: RatingListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let repository: RatingsRepositoryInMemory;
const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('RatingsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new RatingsRepositoryInMemory();
	});

	it('enforces a single rating per (drink_id, user_id) pair', async () => {
		await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
		await expect(repository.create({ drink_id: drinkId, user_id: userId, value: 2 })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('keeps associations immutable on update and changes only value', async () => {
		const created = await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
		const updated = await repository.update({ id: created._id.toString(), value: 2 });
		expect(updated.value).toBe(2);
		expect(updated.drink_id).toBe(drinkId);
		expect(updated.user_id).toBe(userId);
		expect(updated.created_at).toEqual(created.created_at);
	});

	it('finds by drink and by user', async () => {
		const otherUser = new ObjectId().toString();
		await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
		await repository.create({ drink_id: drinkId, user_id: otherUser, value: 3 });

		expect((await repository.findByDrink(drinkId, query)).length).toBe(2);
		expect((await repository.findByUser(userId, query)).length).toBe(1);
		expect(await repository.findByDrinkAndUser(drinkId, userId)).not.toBeNull();
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		expect(await repository.findByDrink(new ObjectId().toString(), query)).toEqual([]);
	});

	it('applies sort and deterministic _id tie-breaker for equal timestamps', async () => {
		const sameDate = new Date('2024-01-01T00:00:00Z');
		const a = await repository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), value: 1 });
		const b = await repository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), value: 2 });
		a.created_at = sameDate;
		b.created_at = sameDate;

		const result = await repository.findAll(query);
		const ids = result.map((r) => r._id.toString());
		const expected = [a._id.toString(), b._id.toString()].sort((x, y) => (x > y ? -1 : 1));
		expect(ids).toEqual(expected);
	});

	it('returns exact bulk delete counts including zero', async () => {
		await repository.create({ drink_id: drinkId, user_id: userId, value: 4 });
		await repository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), value: 3 });

		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByDrink(drinkId)).toBe(0);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});

	it('paginates results', async () => {
		for (let i = 0; i < 5; i++) {
			await repository.create({ drink_id: new ObjectId().toString(), user_id: userId, value: 3 });
		}
		const page = await repository.findByUser(userId, { page: 2, limit: 2, sort: { created_at: -1, _id: -1 } });
		expect(page.length).toBe(2);
	});
});
