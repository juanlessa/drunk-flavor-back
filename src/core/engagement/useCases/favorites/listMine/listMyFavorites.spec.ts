import { Drink, IDrinksModule } from '@/core/drinks/public';
import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { decodeCursor } from '@/shared/helpers/cursor.helpers';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListMyFavoritesService } from './ListMyFavorites.service';

let favoritesRepository: FavoritesRepositoryInMemory;
let service: ListMyFavoritesService;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

const findDrinksByIds = vi.fn();
const drinksModule: IDrinksModule = {
	findDrinkById: vi.fn().mockResolvedValue(null),
	findDrinksByIds,
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 0, count: 0 }),
	clearCreatorByUser: vi.fn().mockResolvedValue(0),
};
const storageProvider = { getFileURL: (name: string) => `https://cdn.test/${name}` } as IStorageProvider;

const makeDrink = (id: string) =>
	({
		id,
		createdBy: 'creator',
		updatedBy: 'creator',
		cover: { name: 'cover.png', mimetype: 'image/png', url: '' },
		thumbnail: { name: 'thumb.png', mimetype: 'image/png', url: '' },
	}) as unknown as Drink;

describe('List My Favorites', () => {
	beforeEach(() => {
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new ListMyFavoritesService(favoritesRepository, drinksModule, storageProvider);
		findDrinksByIds
			.mockReset()
			.mockImplementation(({ drinkIds }: { drinkIds: string[] }) => Promise.resolve(drinkIds.map(makeDrink)));
	});

	it('returns each favorite with its drink, with file urls and without authorship', async () => {
		const drinkId = new ObjectId().toString();
		await favoritesRepository.add({ drinkId, userId: actor.id });

		const page = await service.execute({ query: { limit: 10 }, actor });

		expect(page.items).toHaveLength(1);
		expect(page.items[0]).toMatchObject({ drinkId, userId: actor.id });
		expect(page.items[0].drink.cover?.url).toBe('https://cdn.test/cover.png');
		expect(page.items[0].drink.thumbnail?.url).toBe('https://cdn.test/thumb.png');
		expect(page.items[0].drink).not.toHaveProperty('createdBy');
		expect(page.items[0].drink).not.toHaveProperty('updatedBy');
		expect(page.nextCursor).toBeNull();
	});

	it('does not ask for drinks when the actor has no favorites', async () => {
		await expect(service.execute({ query: { limit: 10 }, actor })).resolves.toEqual({
			items: [],
			nextCursor: null,
		});
		expect(findDrinksByIds).not.toHaveBeenCalled();
	});

	it('returns an opaque cursor that leads to the next page', async () => {
		for (let index = 0; index < 3; index++) {
			await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId: actor.id });
		}

		const first = await service.execute({ query: { limit: 2 }, actor });
		const cursor = first.nextCursor ? decodeCursor(first.nextCursor) : null;
		const second = await service.execute({ query: { limit: 2, cursor: cursor ?? undefined }, actor });

		expect(first.items).toHaveLength(2);
		expect(cursor).not.toBeNull();
		expect(second.items).toHaveLength(1);
		expect(second.nextCursor).toBeNull();
	});

	it('leaves out a favorite whose drink no longer exists but keeps the cursor', async () => {
		for (let index = 0; index < 3; index++) {
			await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId: actor.id });
		}
		findDrinksByIds.mockImplementation(({ drinkIds }: { drinkIds: string[] }) =>
			Promise.resolve(drinkIds.slice(1).map(makeDrink)),
		);

		const page = await service.execute({ query: { limit: 2 }, actor });

		expect(page.items).toHaveLength(1);
		expect(page.nextCursor).not.toBeNull();
	});
});
