import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { withActor, withCreator, withEditor } from '@/core/drinks/factories/authorship.factories';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { BadRequestError, NotFoundError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { createDrinkFactory, createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { UpdateDrinkCoverService } from './UpdateDrinkCover.service';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { Readable } from 'node:stream';
import { hasFileExtension } from '@/shared/helpers/file.helpers';
import { FileMetadata } from '@/shared/types/file.types';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let drinksRepository: IDrinksRepository;
let storageProvider: IStorageProvider;
let cleanupQueueProvider: MockCleanupQueueProvider;
let service: UpdateDrinkCoverService;

const { translations: categoryTranslations } = createCategoryFactory();
const { translations: translationsIngredient } = createIngredientFactory();

const { translations } = createDrinkFactory();

const fileName = 'imageTestingFile.png';
const fileMimetype = 'image/png';

const mockedFileStream = Object.assign(
	new Readable({
		read(_size) {
			this.push(null);
		},
	}),
	{ truncated: false, bytesRead: 1234, pipe: vi.fn(), on: vi.fn() },
);

let ingredient: Ingredient;
let createdDrink: Drink;

describe('Update Drink', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		cleanupQueueProvider = new MockCleanupQueueProvider();
		service = new UpdateDrinkCoverService(drinksRepository, storageProvider, cleanupQueueProvider);

		const category = await categoriesRepository.create(
			withCreator({ translations: categoryTranslations, isAlcoholic: false }),
		);
		const unit = await unitsRepository.create(createUnitFactory());
		ingredient = await ingredientsRepository.create(
			withCreator({
				translations: translationsIngredient,
				category: category,
				units: [unit],
			}),
		);
		createdDrink = await drinksRepository.create(
			withCreator({
				translations,
				ingredients: [createDrinkIngredientFactory(ingredient, { quantity: 30 })],
			}),
		);
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to update a drink cover', async () => {
		await service.execute(
			withActor({
				drinkId: createdDrink.id,
				name: fileName,
				mimetype: fileMimetype,
				fileStream: mockedFileStream,
			}),
		);

		const findUpdatedDrink = (await drinksRepository.findById(createdDrink.id)) as Drink;
		const drinkId = createdDrink.id;
		const [, subtype] = fileMimetype.split('/');

		expect(findUpdatedDrink.cover).toBeDefined();
		expect(findUpdatedDrink.cover?.mimetype).toEqual(fileMimetype);
		// The stored name is fully server-generated: <hash>-<ownerId>-<role>.<ext>. It must not
		// contain the client-supplied file name (path-traversal protection).
		expect(findUpdatedDrink.cover?.name).not.toContain(fileName);
		expect(findUpdatedDrink.cover?.name).toMatch(new RegExp(`^[0-9a-f]{32}-${drinkId}-cover\\.${subtype}$`));
		expect(storageProvider.uploadFile).toHaveBeenCalledTimes(1);
	});

	it('should not be able to update the cover to a non-image file', async () => {
		await expect(
			service.execute(
				withActor({
					drinkId: new ObjectId().toString(),
					name: fileName,
					mimetype: 'application/json',
					fileStream: mockedFileStream,
				}),
			),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update the cover of a nonexistent drink', async () => {
		await expect(
			service.execute(
				withActor({
					drinkId: new ObjectId().toString(),
					name: fileName,
					mimetype: fileMimetype,
					fileStream: mockedFileStream,
				}),
			),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	const previousName = 'previous-cover-file.png';
	const updateCommand = () =>
		withActor({
			drinkId: createdDrink.id,
			name: fileName,
			mimetype: fileMimetype,
			fileStream: mockedFileStream,
		});

	it('should enqueue the removal of the previous cover once the new one is in place', async () => {
		await drinksRepository.update(
			withEditor({
				id: createdDrink.id,
				cover: { name: previousName, mimetype: fileMimetype, url: '' },
			}),
		);
		await service.execute(updateCommand());
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: previousName },
			{ deduplicationKey: `delete-storage-file-${previousName}` },
		);
		expect(storageProvider.deleteFile).not.toHaveBeenCalled();
	});

	it('should not enqueue any removal when there was no previous cover', async () => {
		await service.execute(updateCommand());
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});

	it('should keep the previous cover and enqueue the removal of the new file when the update fails', async () => {
		await drinksRepository.update(
			withEditor({
				id: createdDrink.id,
				cover: { name: previousName, mimetype: fileMimetype, url: '' },
			}),
		);
		vi.spyOn(drinksRepository, 'update').mockRejectedValueOnce(new Error('database unavailable'));
		await expect(service.execute(updateCommand())).rejects.toThrow('database unavailable');
		const stored = (await drinksRepository.findById(createdDrink.id)) as Drink;
		expect(stored.cover?.name).toBe(previousName);
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledTimes(1);
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: expect.stringMatching(/^[0-9a-f]{32}-.*-cover\.png$/) as string },
			expect.anything(),
		);
	});

	it('should keep the update when the removal of the previous cover cannot be enqueued', async () => {
		await drinksRepository.update(
			withEditor({
				id: createdDrink.id,
				cover: { name: previousName, mimetype: fileMimetype, url: '' },
			}),
		);
		cleanupQueueProvider.addMock.mockRejectedValueOnce(new Error('queue unavailable'));
		await expect(service.execute(updateCommand())).resolves.toBeUndefined();
		const stored = (await drinksRepository.findById(createdDrink.id)) as Drink;
		expect(stored.cover?.name).not.toBe(previousName);
	});

	it('should set the file extension from the mime type regardless of the uploaded name', async () => {
		await service.execute(
			withActor({
				drinkId: createdDrink.id,
				name: 'imageFileNameWithoutExtension',
				mimetype: fileMimetype,
				fileStream: mockedFileStream,
			}),
		);

		const foundDrink = (await drinksRepository.findById(createdDrink.id)) as Drink;
		const drinkCover = foundDrink.cover as FileMetadata;

		expect(drinkCover).toBeDefined();
		expect(drinkCover).toHaveProperty('name');
		expect(hasFileExtension(drinkCover.name, fileMimetype)).toBe(true);
		expect(drinkCover.name).not.toContain('imageFileNameWithoutExtension');
	});
});
