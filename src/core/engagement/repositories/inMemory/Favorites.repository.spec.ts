import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let repository: FavoritesRepositoryInMemory;
const drinkId = new ObjectId().toString();
const userId = new ObjectId().toString();

describe('FavoritesRepositoryInMemory', () => {
	beforeEach(() => {
		repository = new FavoritesRepositoryInMemory();
	});

	it('returns the existing favorite when the pair is added again', async () => {
		const first = await repository.add({ drinkId, userId });
		const second = await repository.add({ drinkId, userId });

		expect(second).toEqual(first);
		expect(repository.collection).toHaveLength(1);
	});

	it('reports whether a favorite was removed', async () => {
		await repository.add({ drinkId, userId });

		await expect(repository.remove({ drinkId, userId })).resolves.toBe(true);
		await expect(repository.remove({ drinkId, userId })).resolves.toBe(false);
	});

	it('pages the favorites of a user newest first without repeating or skipping any', async () => {
		vi.useFakeTimers();
		const added: string[] = [];
		for (let index = 0; index < 5; index++) {
			vi.setSystemTime(new Date(2025, 0, 1, 0, 0, index));
			const created = await repository.add({ drinkId: new ObjectId().toString(), userId });
			added.push(created.drinkId);
		}
		vi.useRealTimers();
		await repository.add({ drinkId: new ObjectId().toString(), userId: new ObjectId().toString() });

		const first = await repository.findPageByUser(userId, { limit: 2 });
		const second = await repository.findPageByUser(userId, { limit: 2, cursor: first.nextCursor ?? undefined });
		const third = await repository.findPageByUser(userId, { limit: 2, cursor: second.nextCursor ?? undefined });

		expect(first.items.map((item) => item.drinkId)).toEqual([added[4], added[3]]);
		expect(second.items.map((item) => item.drinkId)).toEqual([added[2], added[1]]);
		expect(third.items.map((item) => item.drinkId)).toEqual([added[0]]);
		expect(first.nextCursor).not.toBeNull();
		expect(second.nextCursor).not.toBeNull();
		expect(third.nextCursor).toBeNull();
	});
});
