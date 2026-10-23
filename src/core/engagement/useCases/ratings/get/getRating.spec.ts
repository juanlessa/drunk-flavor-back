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
			drink_id: new ObjectId().toString(),
			user_id: new ObjectId().toString(),
			value: 4,
		});
		const found = await service.execute({ id: created._id.toString() });
		expect(found._id.toString()).toBe(created._id.toString());
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString() })).rejects.toBeInstanceOf(BadRequestError);
	});
});
