import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { Roles } from '@/shared/accessControl/roles';
import { GetMineByDrinkService } from './GetMineByDrink.service';

let repository: RatingsRepositoryInMemory;
let service: GetMineByDrinkService;
const actor = { id: new ObjectId().toString(), role: Roles.member };

beforeEach(() => {
	repository = new RatingsRepositoryInMemory();
	service = new GetMineByDrinkService(repository);
});

describe('GetMineByDrinkService', () => {
	it('returns only the actor rating for the drink', async () => {
		const drinkId = new ObjectId().toString();
		const own = await repository.create({ drinkId, userId: actor.id, value: 4 });
		await repository.create({ drinkId, userId: new ObjectId().toString(), value: 2 });

		await expect(service.execute({ drinkId, actor })).resolves.toEqual(own);
	});

	it('returns null when the actor has not rated the drink', async () => {
		await expect(service.execute({ drinkId: new ObjectId().toString(), actor })).resolves.toBeNull();
	});
});
