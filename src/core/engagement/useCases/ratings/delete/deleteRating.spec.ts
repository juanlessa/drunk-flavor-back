import { IDrinksModule } from '@/shared/providers/moduleCommunication/drinks';
import { Actor } from '@/shared/accessControl/actor.types';
import { IRatingsRepository } from '@/core/engagement/repositories/IRatings.repository';
import { RatingsRepositoryInMemory } from '@/core/engagement/repositories/inMemory/Ratings.repository';
import { resolveDeleteRatingService } from './deleteRating.container';
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
	applyRatingDelta: vi.fn().mockResolvedValue({ average: 0, count: 0 }),
};
const transactionManager = new FakeTransactionManager();

describe('Delete Rating', () => {
	beforeEach(() => {
		ratingsRepository = new RatingsRepositoryInMemory();
		service = new DeleteRatingService(ratingsRepository, drinksModule, transactionManager);
	});

	it('allows an owner to delete its rating', async () => {
		const created = await ratingsRepository.create({ drink_id: drinkId, user_id: ownerId, value: 4 });
		await service.execute({ id: created._id.toString(), actor: owner });
		expect(await ratingsRepository.findById(created._id.toString())).toBeNull();
	});

	it('allows an Admin to delete a foreign rating', async () => {
		const created = await ratingsRepository.create({ drink_id: drinkId, user_id: ownerId, value: 4 });
		await service.execute({ id: created._id.toString(), actor: admin });
		expect(await ratingsRepository.findById(created._id.toString())).toBeNull();
	});

	it('forbids a non-owner member from deleting a foreign rating', async () => {
		const created = await ratingsRepository.create({ drink_id: drinkId, user_id: ownerId, value: 4 });
		await expect(service.execute({ id: created._id.toString(), actor: foreignMember })).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('rejects a nonexistent rating', async () => {
		await expect(service.execute({ id: new ObjectId().toString(), actor: owner })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});

	it('exposes a container using the public Drinks module boundary', () => {
		expect(Object.values(resolveDeleteRatingService())).toHaveLength(3);
	});
});
