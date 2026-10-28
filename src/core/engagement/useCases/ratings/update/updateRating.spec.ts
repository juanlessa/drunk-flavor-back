import { IDrinksModule } from '@/core/drinks/public';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { resolveUpdateRatingService } from './updateRating.container';
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
const transactionManager = new FakeTransactionManager();

describe('Update Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new UpdateRatingService(ratingsRepository, drinksModule, transactionManager);
	});

	it('re-rates the same record and preserves associations and creation time', async () => {
		const created = await ratingsRepository.create({ drink_id: drinkId, user_id: ownerId, value: 4 });
		await service.execute({ id: created._id.toString(), value: 2, actor: owner });
		const updated = await ratingsRepository.findById(created._id.toString());
		expect(updated?.value).toBe(2);
		expect(updated?.drink_id).toBe(drinkId);
		expect(updated?.user_id).toBe(ownerId);
		expect(updated?.created_at).toEqual(created.created_at);
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), value: 3, actor: owner })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('forbids updating a foreign rating', async () => {
		const created = await ratingsRepository.create({ drink_id: drinkId, user_id: ownerId, value: 4 });
		await expect(service.execute({ id: created._id.toString(), value: 3, actor: foreign })).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('exposes a container using the public Drinks module boundary', () => {
		expect(resolveUpdateRatingService()).toBeInstanceOf(UpdateRatingService);
		expect(Object.values(resolveUpdateRatingService())).toHaveLength(3);
	});
});
