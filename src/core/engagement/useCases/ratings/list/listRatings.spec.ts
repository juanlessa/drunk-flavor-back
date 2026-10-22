import { RatingListQuery } from '@/core/engagement/dtos/rating.dtos';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { Roles } from '@/shared/accessControl/roles';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListRatingsService } from './ListRatings.service';
import { ListRatingsByDrinkService } from '../listByDrink/ListRatingsByDrink.service';
import { ListMyRatingsService } from '../listMine/ListMyRatings.service';

const query: RatingListQuery = { page: 1, limit: 50, sort: { created_at: -1, _id: -1 } };

let ratingsRepository: IRatingsRepository;
const drinkId = new ObjectId().toString();
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('List Ratings', () => {
	beforeEach(async () => {
		ratingsRepository = new RatingsRepositoryInMemory();
		await ratingsRepository.create({ drink_id: drinkId, user_id: actor.id, value: 4 });
		await ratingsRepository.create({ drink_id: drinkId, user_id: new ObjectId().toString(), value: 3 });
		await ratingsRepository.create({ drink_id: new ObjectId().toString(), user_id: actor.id, value: 2 });
	});

	it('lists all ratings globally', async () => {
		const service = new ListRatingsService(ratingsRepository);
		expect((await service.execute({ query })).length).toBe(3);
	});

	it('lists ratings by drink', async () => {
		const service = new ListRatingsByDrinkService(ratingsRepository);
		expect((await service.execute({ drink_id: drinkId, query })).length).toBe(2);
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		const service = new ListRatingsByDrinkService(ratingsRepository);
		expect(await service.execute({ drink_id: new ObjectId().toString(), query })).toEqual([]);
	});

	it('scopes current-user ratings to the actor', async () => {
		const service = new ListMyRatingsService(ratingsRepository);
		const mine = await service.execute({ query, actor });
		expect(mine.length).toBe(2);
		expect(mine.every((r) => r.user_id === actor.id)).toBe(true);
	});
});
