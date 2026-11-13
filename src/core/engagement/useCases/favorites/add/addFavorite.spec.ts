import { IDrinksModule } from '@/core/drinks/public';
import { MAX_FAVORITES_PER_USER } from '@/core/engagement/constants/favorite.constants';
import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ConflictError, NotFoundError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddFavoriteService } from './AddFavorite.service';

let favoritesRepository: FavoritesRepositoryInMemory;
let service: AddFavoriteService;
let drinkId: string;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

const findDrinkById = vi.fn();
const drinksModule: IDrinksModule = {
	findDrinkById,
	findDrinksByIds: vi.fn().mockResolvedValue([]),
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 0, count: 0 }),
	clearCreatorByUser: vi.fn().mockResolvedValue(0),
};

describe('Add Favorite', () => {
	beforeEach(() => {
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new AddFavoriteService(favoritesRepository, drinksModule);
		drinkId = new ObjectId().toString();
		findDrinkById.mockReset().mockResolvedValue({ id: drinkId });
	});

	it('saves the drink as a favorite of the actor', async () => {
		await service.execute({ drinkId, actor });

		expect(favoritesRepository.collection).toHaveLength(1);
		expect(favoritesRepository.collection[0]).toMatchObject({ drinkId, userId: actor.id });
	});

	it('is idempotent: repeating it keeps a single favorite', async () => {
		await service.execute({ drinkId, actor });
		await service.execute({ drinkId, actor });

		expect(favoritesRepository.collection).toHaveLength(1);
	});

	it('rejects a drink that does not exist', async () => {
		findDrinkById.mockResolvedValue(null);

		await expect(service.execute({ drinkId, actor })).rejects.toBeInstanceOf(NotFoundError);
		expect(favoritesRepository.collection).toHaveLength(0);
	});

	describe('favorites limit', () => {
		const fill = async (count: number) => {
			for (let index = 0; index < count; index++) {
				await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId: actor.id });
			}
		};

		it('accepts the favorite that reaches the limit', async () => {
			await fill(MAX_FAVORITES_PER_USER - 1);

			await service.execute({ drinkId, actor });

			expect(await favoritesRepository.countByUser(actor.id)).toBe(MAX_FAVORITES_PER_USER);
		});

		it('rejects a new favorite past the limit', async () => {
			await fill(MAX_FAVORITES_PER_USER);

			await expect(service.execute({ drinkId, actor })).rejects.toBeInstanceOf(ConflictError);
			expect(await favoritesRepository.countByUser(actor.id)).toBe(MAX_FAVORITES_PER_USER);
		});

		it('keeps adding an existing favorite idempotent at the limit', async () => {
			await fill(MAX_FAVORITES_PER_USER - 1);
			await service.execute({ drinkId, actor });

			await expect(service.execute({ drinkId, actor })).resolves.toBeUndefined();
		});

		it('undoes its own favorite when a concurrent add already took the last slot', async () => {
			await fill(MAX_FAVORITES_PER_USER - 1);
			const countByUser = vi.spyOn(favoritesRepository, 'countByUser');
			// The pre-check sees room; by the time of the re-check another request has filled the last slot.
			countByUser
				.mockResolvedValueOnce(MAX_FAVORITES_PER_USER - 1)
				.mockResolvedValueOnce(MAX_FAVORITES_PER_USER + 1);

			await expect(service.execute({ drinkId, actor })).rejects.toBeInstanceOf(ConflictError);
			expect(await favoritesRepository.findByDrinkAndUser(drinkId, actor.id)).toBeNull();
		});
	});
});
