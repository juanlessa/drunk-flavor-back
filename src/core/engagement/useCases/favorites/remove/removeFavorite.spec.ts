import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { RemoveFavoriteService } from './RemoveFavorite.service';

let favoritesRepository: FavoritesRepositoryInMemory;
let service: RemoveFavoriteService;
let drinkId: string;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('Remove Favorite', () => {
	beforeEach(() => {
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new RemoveFavoriteService(favoritesRepository);
		drinkId = new ObjectId().toString();
	});

	it('removes the favorite of the actor', async () => {
		await favoritesRepository.add({ drinkId, userId: actor.id });

		await service.execute({ drinkId, actor });

		expect(favoritesRepository.collection).toHaveLength(0);
	});

	it('is idempotent: removing a drink that is not a favorite is not an error', async () => {
		await expect(service.execute({ drinkId, actor })).resolves.toBeUndefined();
	});

	it('leaves the favorite of another user untouched', async () => {
		const otherUserId = new ObjectId().toString();
		await favoritesRepository.add({ drinkId, userId: otherUserId });

		await service.execute({ drinkId, actor });

		expect(favoritesRepository.collection).toHaveLength(1);
		expect(favoritesRepository.collection[0].userId).toBe(otherUserId);
	});
});
