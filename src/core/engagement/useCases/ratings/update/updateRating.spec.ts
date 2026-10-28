import { IDrinksModule } from '@/core/drinks/public';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateRatingService } from './UpdateRating.service';

let ratingsRepository: IRatingsRepository;
let service: UpdateRatingService;
const ownerId = new ObjectId().toString();
const drinkId = new ObjectId().toString();
const owner: Actor = { id: ownerId, role: Roles.member };
const foreign: Actor = { id: new ObjectId().toString(), role: Roles.member };
const drinksModule: IDrinksModule = {
	findDrinkById: vi.fn().mockResolvedValue(null),
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 2, count: 1 }),
};

describe('Update Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new UpdateRatingService(ratingsRepository, drinksModule, new FakeTransactionManager());
	});

	it('re-rates the same record and preserves associations and creation time', async () => {
		const created = await ratingsRepository.create({ drinkId, userId: ownerId, value: 4 });
		await service.execute({ id: created.id, value: 2, actor: owner });
		const updated = await ratingsRepository.findById(created.id);
		expect(updated?.value).toBe(2);
		expect(updated?.drinkId).toBe(drinkId);
		expect(updated?.userId).toBe(ownerId);
		expect(updated?.createdAt).toEqual(created.createdAt);
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), value: 3, actor: owner })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('forbids updating a foreign rating', async () => {
		const created = await ratingsRepository.create({ drinkId, userId: ownerId, value: 4 });
		await expect(service.execute({ id: created.id, value: 3, actor: foreign })).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});
});
