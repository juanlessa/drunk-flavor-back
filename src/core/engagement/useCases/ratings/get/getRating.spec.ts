import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { BadRequestError } from '@/shared/error/error.lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetRatingService } from './GetRating.service';

let ratingsRepository: IRatingsRepository;
let service: GetRatingService;

describe('Get Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new GetRatingService(ratingsRepository);
	});

	it('returns a stored rating', async () => {
		const created = await ratingsRepository.create({
			drinkId: new ObjectId().toString(),
			userId: new ObjectId().toString(),
			value: 4,
		});
		const found = await service.execute({ id: created.id });
		expect(found.id).toBe(created.id);
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(BadRequestError);
	});
});
