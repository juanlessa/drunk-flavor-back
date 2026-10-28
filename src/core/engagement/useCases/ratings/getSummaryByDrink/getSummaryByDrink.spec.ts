import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { GetSummaryByDrinkService } from './GetSummaryByDrink.service';

let repository: RatingsRepositoryInMemory;
let service: GetSummaryByDrinkService;

beforeEach(() => {
	repository = new RatingsRepositoryInMemory();
	service = new GetSummaryByDrinkService(repository);
});

describe('GetSummaryByDrinkService', () => {
	it('returns the average and count for a drink', async () => {
		const drinkId = new ObjectId().toString();
		await repository.create({ drinkId, userId: new ObjectId().toString(), value: 5 });
		await repository.create({ drinkId, userId: new ObjectId().toString(), value: 3 });

		await expect(service.execute({ drinkId })).resolves.toEqual({ average: 4, count: 2 });
	});

	it('returns an empty summary for an unrated drink', async () => {
		await expect(service.execute({ drinkId: new ObjectId().toString() })).resolves.toEqual({
			average: 0,
			count: 0,
		});
	});
});
