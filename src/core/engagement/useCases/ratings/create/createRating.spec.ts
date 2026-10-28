import { IDrinksModule } from '@/core/drinks/public';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateRatingService } from './CreateRating.service';

let ratingsRepository: IRatingsRepository;
let service: CreateRatingService;
let drinkId: string;
const actor: Actor = { id: new ObjectId().toString(), role: Roles.member };
const drinksModule: IDrinksModule = {
	findDrinkById: vi.fn().mockResolvedValue(null),
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 4, count: 1 }),
};

describe('Create Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new CreateRatingService(ratingsRepository, drinksModule, new FakeTransactionManager());
		drinkId = new ObjectId().toString();
	});

	it('creates a rating with userId derived from the actor', async () => {
		const { id } = await service.execute({ drinkId, value: 4, actor });
		const created = await ratingsRepository.findById(id);
		expect(created?.userId).toBe(actor.id);
		expect(created?.drinkId).toBe(drinkId);
		expect(created?.value).toBe(4);
	});

	it('rejects a duplicate pair before relying on the index', async () => {
		await service.execute({ drinkId, value: 4, actor });
		await expect(service.execute({ drinkId, value: 2, actor })).rejects.toBeInstanceOf(BadRequestError);
	});
});
