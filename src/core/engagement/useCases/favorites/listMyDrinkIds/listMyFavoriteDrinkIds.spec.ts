import { FavoritesRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Favorites.repository';
import { Actor } from '@/shared/accessControl/actor.types';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListMyFavoriteDrinkIdsService } from './ListMyFavoriteDrinkIds.service';

let favoritesRepository: FavoritesRepositoryInMemory;
let service: ListMyFavoriteDrinkIdsService;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('List My Favorite Drink Ids', () => {
	beforeEach(() => {
		favoritesRepository = new FavoritesRepositoryInMemory();
		service = new ListMyFavoriteDrinkIdsService(favoritesRepository);
	});

	it('lists only the drink ids the actor saved', async () => {
		const mine = new ObjectId().toString();
		await favoritesRepository.add({ drinkId: mine, userId: actor.id });
		await favoritesRepository.add({ drinkId: new ObjectId().toString(), userId: new ObjectId().toString() });

		await expect(service.execute({ actor })).resolves.toEqual({ drinkIds: [mine] });
	});
});
