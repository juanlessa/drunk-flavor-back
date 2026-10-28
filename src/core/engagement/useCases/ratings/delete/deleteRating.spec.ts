import { IDrinksModule } from '@/core/drinks/public';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { Roles } from '@/shared/accessControl/roles';
import { BadRequestError, ForbiddenError } from '@/shared/error/error.lib';
import { FakeTransactionManager } from '@/shared/transactions/fakes/FakeTransactionManager';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteRatingService } from './DeleteRating.service';

let ratingsRepository: IRatingsRepository;
let service: DeleteRatingService;
const ownerId = new ObjectId().toString();
const drinkId = new ObjectId().toString();
const owner: Actor = { id: ownerId, role: Roles.member };
const admin: Actor = { id: new ObjectId().toString(), role: Roles.admin };
const foreignMember: Actor = { id: new ObjectId().toString(), role: Roles.member };
const drinksModule: IDrinksModule = {
	findDrinkById: vi.fn().mockResolvedValue(null),
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 0, count: 0 }),
};

describe('Delete Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new DeleteRatingService(ratingsRepository, drinksModule, new FakeTransactionManager());
	});

	it('allows an owner to delete its rating', async () => {
		const created = await ratingsRepository.create({ drinkId, userId: ownerId, value: 4 });
		await service.execute({ id: created.id, actor: owner });
		expect(await ratingsRepository.findById(created.id)).toBeNull();
	});

	it('allows an Admin to delete a foreign rating', async () => {
		const created = await ratingsRepository.create({ drinkId, userId: ownerId, value: 4 });
		await service.execute({ id: created.id, actor: admin });
		expect(await ratingsRepository.findById(created.id)).toBeNull();
	});

	it('forbids a non-owner member from deleting a foreign rating', async () => {
		const created = await ratingsRepository.create({ drinkId, userId: ownerId, value: 4 });
		await expect(service.execute({ id: created.id, actor: foreignMember })).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), actor: owner })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
