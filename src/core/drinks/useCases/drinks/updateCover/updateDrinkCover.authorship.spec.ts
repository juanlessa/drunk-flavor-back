import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actorWithRole, withActor } from '@/core/drinks/factories/authorship.factories';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { Roles } from '@/shared/accessControl/roles';
import { Readable } from 'node:stream';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/shared/error/error.lib';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';

const creatorId = '66b0000000000000000000a1';
const previous = { name: 'previous.png', mimetype: 'image/png', url: '' };
const file = {
	drinkId: '',
	name: 'photo.png',
	mimetype: 'image/png',
	fileStream: Object.assign(new Readable({ read: () => undefined }), { truncated: false, bytesRead: 1 }),
};

let drinksRepository: DrinksRepositoryInMemory;
let storageProvider: MockStorageProvider;
let cleanupQueueProvider: MockCleanupQueueProvider;
let service: UpdateDrinkCoverService;
let drink: Drink;

describe('UpdateDrinkCover: authorship', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		drinksRepository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		cleanupQueueProvider = new MockCleanupQueueProvider();
		service = new UpdateDrinkCoverService(drinksRepository, storageProvider, cleanupQueueProvider);
		({ drink } = await seedDrink(
			{
				categoriesRepository: new CategoriesRepositoryInMemory(),
				unitsRepository: new UnitsRepositoryInMemory(),
				ingredientsRepository: new IngredientsRepositoryInMemory(),
				drinksRepository,
			},
			creatorId,
		));
		drink = await drinksRepository.update({ id: drink.id, updatedBy: creatorId, cover: previous });
	});

	it.each([Roles.admin, Roles.owner])(
		'lets the %s change the cover of a drink created by someone else',
		async (role) => {
			await service.execute(withActor({ ...file, drinkId: drink.id }, actorWithRole(role, 'editor-id')));

			const saved = await drinksRepository.findById(drink.id);
			expect(saved?.cover?.name).not.toBe(previous.name);
			expect(saved).toMatchObject({ createdBy: creatorId, updatedBy: 'editor-id' });
		},
	);

	it('lets a partner change the cover of a drink they created, recording them as the last editor', async () => {
		await service.execute(withActor({ ...file, drinkId: drink.id }, actorWithRole(Roles.partner, creatorId)));

		expect(await drinksRepository.findById(drink.id)).toMatchObject({ createdBy: creatorId, updatedBy: creatorId });
		expect(storageProvider.uploadFile).toHaveBeenCalledTimes(1);
	});

	it('does not let a partner change the cover of a drink created by someone else, nor touch the files', async () => {
		await expect(
			service.execute(withActor({ ...file, drinkId: drink.id }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(ForbiddenError);

		expect(await drinksRepository.findById(drink.id)).toEqual(drink);
		expect(storageProvider.uploadFile).not.toHaveBeenCalled();
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('does not let a member change the cover of a drink, not even one that has their id as creator', async () => {
		await expect(
			service.execute(withActor({ ...file, drinkId: drink.id }, actorWithRole(Roles.member, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
		expect(storageProvider.uploadFile).not.toHaveBeenCalled();
	});

	it('does not let a partner change the cover of a drink whose creator closed the account', async () => {
		await drinksRepository.clearCreatorByUser(creatorId);

		await expect(
			service.execute(withActor({ ...file, drinkId: drink.id }, actorWithRole(Roles.partner, creatorId))),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('reports a missing drink before checking who asks', async () => {
		await expect(
			service.execute(withActor({ ...file, drinkId: '66b0000000000000000000ff' }, actorWithRole(Roles.partner))),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('reports an unsupported file before checking who asks', async () => {
		await expect(
			service.execute(
				withActor({ ...file, mimetype: 'application/json', drinkId: drink.id }, actorWithRole(Roles.partner)),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
