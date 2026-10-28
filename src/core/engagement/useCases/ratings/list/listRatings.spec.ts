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

const query: RatingListQuery = { page: 1, limit: 50, sort: { createdAt: -1, id: -1 } };
let ratingsRepository: IRatingsRepository;
const drinkId = new ObjectId().toString();
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };

describe('List Ratings', () => {
	beforeEach(async () => {
		ratingsRepository = new RatingsRepositoryInMemory();
		await ratingsRepository.create({ drinkId, userId: actor.id, value: 4 });
		await ratingsRepository.create({ drinkId, userId: new ObjectId().toString(), value: 3 });
		await ratingsRepository.create({ drinkId: new ObjectId().toString(), userId: actor.id, value: 2 });
	});

	it('lists all ratings globally', async () => {
		expect(await new ListRatingsService(ratingsRepository).execute({ query })).toHaveLength(3);
	});

	it('lists ratings by drink', async () => {
		expect(await new ListRatingsByDrinkService(ratingsRepository).execute({ drinkId, query })).toHaveLength(2);
	});

	it('returns an empty array for a valid nonexistent drink', async () => {
		expect(
			await new ListRatingsByDrinkService(ratingsRepository).execute({
				drinkId: new ObjectId().toString(),
				query,
			}),
		).toEqual([]);
	});

	it('scopes current-user ratings to the actor', async () => {
		const mine = await new ListMyRatingsService(ratingsRepository).execute({ query, actor });
		expect(mine).toHaveLength(2);
		expect(mine.every((rating) => rating.userId === actor.id)).toBe(true);
	});
});
