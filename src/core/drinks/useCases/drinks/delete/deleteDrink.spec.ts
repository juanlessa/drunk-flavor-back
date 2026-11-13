import { Category } from '@/core/drinks/entities/category.entity';
import { withActor, withCreator, withEditor } from '@/core/drinks/factories/authorship.factories';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { ObjectId } from 'mongodb';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteDrinkService } from './DeleteDrink.service';
import { NotFoundError } from '@/shared/error/error.lib';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createUnitFactory } from '@/core/drinks/factories/unit.factories';
import { createDrinkFactory, createDrinkIngredientFactory } from '@/core/drinks/factories/drink.factories';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { IUnitsRepository } from '@/core/drinks/repositories/IUnits.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { MockCleanupQueueProvider } from '@/shared/providers/queue/cleanup/implementations/MockCleanupQueue.provider';
import { CLEANUP_JOB_NAMES } from '@/shared/providers/queue/cleanup/cleanupQueue.constants';
import { Drink } from '@/core/drinks/entities/drink.entity';

let categoriesRepository: ICategoriesRepository;
let ingredientsRepository: IIngredientsRepository;
let unitsRepository: IUnitsRepository;
let drinksRepository: IDrinksRepository;
let cleanupQueueProvider: MockCleanupQueueProvider;
let service: DeleteDrinkService;

const { translations: categoryTranslations } = createCategoryFactory();
let createdCategory: Category;
let createdUnit: Unit;
const { translations: ingredientTranslations } = createIngredientFactory();
let createdIngredient: Ingredient;
const { translations } = createDrinkFactory();

let createdDrink: Drink;

describe('Delete Drink', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepository = new CategoriesRepositoryInMemory();
		ingredientsRepository = new IngredientsRepositoryInMemory();
		unitsRepository = new UnitsRepositoryInMemory();
		drinksRepository = new DrinksRepositoryInMemory();
		cleanupQueueProvider = new MockCleanupQueueProvider();
		service = new DeleteDrinkService(drinksRepository, cleanupQueueProvider);

		createdCategory = await categoriesRepository.create(
			withCreator({
				translations: categoryTranslations,
				isAlcoholic: false,
			}),
		);
		createdUnit = await unitsRepository.create(createUnitFactory());
		createdIngredient = await ingredientsRepository.create(
			withCreator({
				translations: ingredientTranslations,
				category: createdCategory,
				units: [createdUnit],
			}),
		);
		createdDrink = await drinksRepository.create(
			withCreator({
				translations,
				ingredients: [createDrinkIngredientFactory(createdIngredient, { quantity: 60 })],
			}),
		);
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to delete a drink', async () => {
		await service.execute(withActor({ id: createdDrink.id }));

		const found = await drinksRepository.findById(createdDrink.id);

		expect(found).toBeNull();
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute(withActor({ id: nonexistentId }))).rejects.toBeInstanceOf(NotFoundError);
	});

	it('should enqueue the engagement cleanup of the deleted drink', async () => {
		await service.execute(withActor({ id: createdDrink.id }));
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteDrinkEngagement,
			{ drinkId: createdDrink.id },
			{ deduplicationKey: `delete-drink-engagement-${createdDrink.id}` },
		);
	});

	it('should enqueue the removal of the cover and thumbnail when deleting a drink', async () => {
		await drinksRepository.update(
			withEditor({
				id: createdDrink.id,
				cover: { name: 'coverFile.png', mimetype: 'image/png', url: '' },
				thumbnail: { name: 'thumbnailFile.jpeg', mimetype: 'image/jpeg', url: '' },
			}),
		);
		await service.execute(withActor({ id: createdDrink.id }));
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: 'coverFile.png' },
			{ deduplicationKey: 'delete-storage-file-coverFile.png' },
		);
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledWith(
			CLEANUP_JOB_NAMES.deleteStorageFile,
			{ fileName: 'thumbnailFile.jpeg' },
			{ deduplicationKey: 'delete-storage-file-thumbnailFile.jpeg' },
		);
	});

	it('should not enqueue any file removal when the drink has no files', async () => {
		await service.execute(withActor({ id: createdDrink.id }));
		expect(cleanupQueueProvider.addMock).toHaveBeenCalledTimes(1);
	});

	it('should keep the deletion when a cleanup job cannot be enqueued', async () => {
		cleanupQueueProvider.addMock.mockRejectedValueOnce(new Error('queue unavailable'));
		await expect(service.execute(withActor({ id: createdDrink.id }))).resolves.toBeUndefined();
		expect(await drinksRepository.findById(createdDrink.id)).toBeNull();
	});

	it('should not enqueue any cleanup when the drink does not exist', async () => {
		await expect(service.execute(withActor({ id: new ObjectId().toString() }))).rejects.toBeInstanceOf(
			NotFoundError,
		);
		expect(cleanupQueueProvider.addMock).not.toHaveBeenCalled();
	});
});
