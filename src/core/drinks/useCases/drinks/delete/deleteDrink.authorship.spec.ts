import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { DeleteDrinkService } from './DeleteDrink.service';

const creatorId = '66b0000000000000000000a1';
const cover = { name: 'cover.png', mimetype: 'image/png', url: '' };

let drinksRepository: DrinksRepositoryInMemory;
let cleanupQueueProvider: MockCleanupQueueProvider;
let service: DeleteDrinkService;
let drink: Drink;

describe('Delete Drink: authorship', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		drinksRepository = new DrinksRepositoryInMemory();
		cleanupQueueProvider = new MockCleanupQueueProvider();
		service = new DeleteDrinkService(drinksRepository, cleanupQueueProvider);
		({ drink } = await seedDrink(
			{
				categoriesRepository: new CategoriesRepositoryInMemory(),
				unitsRepository: new UnitsRepositoryInMemory(),
				ingredientsRepository: new IngredientsRepositoryInMemory(),
				drinksRepository,
			},
			creatorId,
		));
		drink = await drinksRepository.update({ id: drink.id, updatedBy: creatorId, cover });
	});

	it.each([Roles.admin, Roles.owner])('lets the %s delete a drink created by someone else', async (role) => {
		await service.execute(withActor({ id: drink.id }, actorWithRole(role)));

		expect(await drinksRepository.findById(drink.id)).toBeNull();
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: cover.name },
			{ deduplicationKey: `delete-storage-file-${cover.name}` },
		);
	});

	it('lets a partner delete a drink they created', async () => {
		await service.execute(withActor({ id: drink.id }, actorWithRole(Roles.partner, creatorId)));

		expect(await drinksRepository.findById(drink.id)).toBeNull();
	});

	it('does not let a partner delete a drink created by someone else, nor remove its files', async () => {
		await expect(service.execute(withActor({ id: drink.id }, actorWithRole(Roles.partner)))).rejects.toBeInstanceOf(
			ForbiddenError,
		);

		expect(await drinksRepository.findById(drink.id)).not.toBeNull();
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('does not let a partner delete a drink whose creator closed the account', async () => {
		await drinksRepository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor({ id: drink.id }, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(await drinksRepository.findById(drink.id)).not.toBeNull();
	});

	it('does not let a member delete a drink, not even one that has their id as creator', async () => {
		await expect(
			service.execute(withActor({ id: drink.id }, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing drink before checking who asks', async () => {
		await expect(
			service.execute(withActor({ id: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
