import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';

const query: RatingListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };

let repository: RatingsRepositoryInMemory;
const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('RatingsRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new RatingsRepositoryInMemory();
	});

	it('enforces a single rating per drink and user pair', async () => {
		await repository.create({ drinkId, userId, value: 4 });
		await expect(repository.create({ drinkId, userId, value: 2 })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('keeps associations immutable on update and changes only value', async () => {
		const created = await repository.create({ drinkId, userId, value: 4 });
		const updated = await repository.update({ id: created.id, value: 2 });
		expect(updated.value).toBe(2);
		expect(updated.drinkId).toBe(drinkId);
		expect(updated.userId).toBe(userId);
		expect(updated.createdAt).toEqual(created.createdAt);
	});

	it('finds by drink and by user', async () => {
		const otherUser = new ObjectId().toString();
		await repository.create({ drinkId, userId, value: 4 });
		await repository.create({ drinkId, userId: otherUser, value: 3 });

		expect((await repository.findByDrink(drinkId, query)).length).toBe(2);
		expect((await repository.findByUser(userId, query)).length).toBe(1);
		expect(await repository.findByDrinkAndUser(drinkId, userId)).not.toBeNull();
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		expect(await repository.findByDrink(new ObjectId().toString(), query)).toEqual([]);
	});

	it('applies sort and deterministic id tie-breaker for equal timestamps', async () => {
		const sameDate = new Date('2024-01-01T00:00:00Z');
		const first = await repository.create({ drinkId, userId: new ObjectId().toString(), value: 1 });
		const second = await repository.create({ drinkId, userId: new ObjectId().toString(), value: 2 });
		first.createdAt = sameDate;
		second.createdAt = sameDate;

		const ids = (await repository.findAll(query)).map((rating) => rating.id);
		const expected = [first.id, second.id].sort((a, b) => (a > b ? -1 : 1));
		expect(ids).toEqual(expected);
	});

	it('returns exact bulk delete counts including zero', async () => {
		await repository.create({ drinkId, userId, value: 4 });
		await repository.create({ drinkId, userId: new ObjectId().toString(), value: 3 });

		expect(await repository.deleteByDrink(drinkId)).toBe(2);
		expect(await repository.deleteByDrink(drinkId)).toBe(0);
		expect(await repository.deleteByUser(userId)).toBe(0);
	});

	it('paginates results', async () => {
		for (let index = 0; index < 5; index += 1) {
			await repository.create({ drinkId: new ObjectId().toString(), userId, value: 3 });
		}
		const page = await repository.findByUser(userId, { page: 2, limit: 2, sort: { createdAt: -1, id: -1 } });
		expect(page.length).toBe(2);
	});
});
