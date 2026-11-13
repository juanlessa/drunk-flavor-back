import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { FavoriteModel } from '@/core/engagement/infra/mongo/entities/favorite.model';
import { FavoritesRepository } from '@/core/engagement/infra/mongo/repositories/Favorites.repository';

let repository: FavoritesRepository;

describe('FavoritesRepository (integration)', () => {
	beforeAll(async () => {
		await FavoriteModel.init();
		repository = new FavoritesRepository();
	});

	afterEach(async () => {
		await FavoriteModel.deleteMany({});
	});

	describe('add', () => {
		it('returns the existing favorite when the pair is added again', async () => {
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();

			const first = await repository.add({ drinkId, userId });
			const second = await repository.add({ drinkId, userId });

			expect(second.id).toBe(first.id);
			expect(second.createdAt).toEqual(first.createdAt);
			expect(await FavoriteModel.countDocuments({ drink_id: drinkId, user_id: userId })).toBe(1);
		});

		it('resolves a concurrent first add to one record and no error', async () => {
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();

			const results = await Promise.all(Array.from({ length: 8 }, () => repository.add({ drinkId, userId })));

			expect(new Set(results.map((result) => result.id)).size).toBe(1);
			expect(await FavoriteModel.countDocuments({ drink_id: drinkId, user_id: userId })).toBe(1);
		});
	});

	describe('remove', () => {
		it('reports whether a favorite was removed', async () => {
			const drinkId = new ObjectId().toString();
			const userId = new ObjectId().toString();
			await repository.add({ drinkId, userId });

			await expect(repository.remove({ drinkId, userId })).resolves.toBe(true);
			await expect(repository.remove({ drinkId, userId })).resolves.toBe(false);
		});
	});

	describe('findPageByUser', () => {
		const seed = async (userId: string, count: number) => {
			const created: { drinkId: string; createdAt: Date }[] = [];
			for (let index = 0; index < count; index++) {
				const drinkId = new ObjectId().toString();
				// Fixed, distinct dates, because a real clock would make the order depend on timing.
				const createdAt = new Date(Date.UTC(2025, 0, 1, 0, 0, index));
				await FavoriteModel.create({ drink_id: drinkId, user_id: userId, created_at: createdAt });
				created.push({ drinkId, createdAt });
			}
			return created;
		};

		it('pages newest first without repeating or skipping any favorite', async () => {
			const userId = new ObjectId().toString();
			const created = await seed(userId, 5);
			await seed(new ObjectId().toString(), 2);

			const first = await repository.findPageByUser(userId, { limit: 2 });
			const second = await repository.findPageByUser(userId, { limit: 2, cursor: first.nextCursor ?? undefined });
			const third = await repository.findPageByUser(userId, { limit: 2, cursor: second.nextCursor ?? undefined });

			expect(first.items.map((item) => item.drinkId)).toEqual([created[4].drinkId, created[3].drinkId]);
			expect(second.items.map((item) => item.drinkId)).toEqual([created[2].drinkId, created[1].drinkId]);
			expect(third.items.map((item) => item.drinkId)).toEqual([created[0].drinkId]);
			expect(first.nextCursor).not.toBeNull();
			expect(second.nextCursor).not.toBeNull();
			expect(third.nextCursor).toBeNull();
		});

		it('returns no cursor when the page is the last one, even if it is full', async () => {
			const userId = new ObjectId().toString();
			await seed(userId, 2);

			const page = await repository.findPageByUser(userId, { limit: 2 });

			expect(page.items).toHaveLength(2);
			expect(page.nextCursor).toBeNull();
		});

		it('breaks ties between favorites created at the same instant by id', async () => {
			const userId = new ObjectId().toString();
			const createdAt = new Date(Date.UTC(2025, 0, 1));
			for (let index = 0; index < 5; index++) {
				await FavoriteModel.create({
					drink_id: new ObjectId().toString(),
					user_id: userId,
					created_at: createdAt,
				});
			}

			const seen: string[] = [];
			let cursor = undefined as Awaited<ReturnType<typeof repository.findPageByUser>>['nextCursor'] | undefined;
			do {
				const page = await repository.findPageByUser(userId, { limit: 2, cursor: cursor ?? undefined });
				seen.push(...page.items.map((item) => item.id));
				cursor = page.nextCursor;
			} while (cursor);

			expect(seen).toHaveLength(5);
			expect(new Set(seen).size).toBe(5);
		});
	});

	describe('findDrinkIdsByUser', () => {
		it('lists the drink ids of the user only', async () => {
			const userId = new ObjectId().toString();
			const drinkId = new ObjectId().toString();
			await repository.add({ drinkId, userId });
			await repository.add({ drinkId: new ObjectId().toString(), userId: new ObjectId().toString() });

			await expect(repository.findDrinkIdsByUser(userId)).resolves.toEqual([drinkId]);
		});
	});

	describe('findByDrinkAndUser and countByUser', () => {
		it('finds the pair and counts the favorites of the user only', async () => {
			const userId = new ObjectId().toString();
			const drinkId = new ObjectId().toString();
			await repository.add({ drinkId, userId });
			await repository.add({ drinkId: new ObjectId().toString(), userId });
			await repository.add({ drinkId, userId: new ObjectId().toString() });

			expect((await repository.findByDrinkAndUser(drinkId, userId))?.drinkId).toBe(drinkId);
			expect(await repository.findByDrinkAndUser(new ObjectId().toString(), userId)).toBeNull();
			expect(await repository.countByUser(userId)).toBe(2);
		});
	});

	describe('deleteByUser and deleteByDrink', () => {
		it('deletes only what matches', async () => {
			const userId = new ObjectId().toString();
			const drinkId = new ObjectId().toString();
			await repository.add({ drinkId, userId });
			await repository.add({ drinkId, userId: new ObjectId().toString() });
			await repository.add({ drinkId: new ObjectId().toString(), userId });

			await expect(repository.deleteByDrink(drinkId)).resolves.toBe(2);
			await expect(repository.deleteByUser(userId)).resolves.toBe(1);
			expect(await FavoriteModel.countDocuments({})).toBe(0);
		});
	});
});
