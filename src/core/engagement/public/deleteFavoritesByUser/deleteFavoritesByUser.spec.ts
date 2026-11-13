import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { DeleteFavoritesByUserService } from './DeleteFavoritesByUser.service';

let favoritesRepository: FavoritesRepositoryInMemory;
let service: DeleteFavoritesByUserService;

describe('Delete Favorites By User', () => {
	beforeEach(() => {
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new DeleteFavoritesByUserService(favoritesRepository);
	});

	it('deletes every favorite of a user and returns the count', async () => {
		const userId = new ObjectId().toString();
		await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId });
		await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId });
		await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId: new ObjectId().toString() });

		await expect(service.execute({ userId })).resolves.toBe(2);
		expect(favoritesRepository.collection).toHaveLength(1);
	});

});
