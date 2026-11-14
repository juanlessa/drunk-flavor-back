import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { seedDrink } from '@/core/drinks/factories/seed.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { UnitsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Units.repository';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';
import { GetCategoryService } from './categories/get/GetCategory.service';
import { ListCategoriesService } from './categories/list/ListCategories.service';
import { GetDrinkService } from './drinks/get/GetDrink.service';
import { ListDrinksService } from './drinks/list/ListDrinks.service';
import { MatchDrinksService } from './drinks/match/MatchDrinks.service';
import { GetIngredientService } from './ingredients/get/GetIngredient.service';
import { ListIngredientsService } from './ingredients/list/ListIngredients.service';
import { GetUnitService } from './units/get/GetUnit.service';
import { ListUnitsService } from './units/list/ListUnits.service';

/**
 * The public reads are anonymous, so they never show who created or last edited a record. The listings that do show
 * it are the ones with authorship, for the people who contribute to the catalog.
 */
describe('Public reads of the catalog', () => {
	const repositories = {
		categoriesRepository: new CategoriesRepositoryInMemory(),
		unitsRepository: new UnitsRepositoryInMemory(),
		ingredientsRepository: new IngredientsRepositoryInMemory(),
		drinksRepository: new DrinksRepositoryInMemory(),
	};
	let seeded: Awaited<ReturnType<typeof seedDrink>>;
	let storageProvider: MockStorageProvider;

	beforeEach(async () => {
		vi.clearAllMocks();
		repositories.categoriesRepository = new CategoriesRepositoryInMemory();
		repositories.unitsRepository = new UnitsRepositoryInMemory();
		repositories.ingredientsRepository = new IngredientsRepositoryInMemory();
		repositories.drinksRepository = new DrinksRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		seeded = await seedDrink(repositories);
	});

	const expectNoAuthorship = (record: object) => {
		expect(record).not.toHaveProperty('createdBy');
		expect(record).not.toHaveProperty('updatedBy');
	};

	it('stores the authorship that the reads are hiding', async () => {
		expect(seeded.drink).toMatchObject({ createdBy: FACTORY_CREATOR_ID, updatedBy: FACTORY_CREATOR_ID });
	});

	describe.each([
		['unit', () => new GetUnitService(repositories.unitsRepository), () => seeded.unit.id],
		['category', () => new GetCategoryService(repositories.categoriesRepository), () => seeded.category.id],
		['ingredient', () => new GetIngredientService(repositories.ingredientsRepository), () => seeded.ingredient.id],
		['drink', () => new GetDrinkService(repositories.drinksRepository, storageProvider), () => seeded.drink.id],
	] as const)('getting a %s', (_name, makeService, getId) => {
		it('does not show who created or last edited it', async () => {
			const record = await makeService().execute({ id: getId() });

			expect(record).toHaveProperty('id', getId());
			expectNoAuthorship(record);
		});
	});

	describe.each([
		['units', () => new ListUnitsService(repositories.unitsRepository)],
		['categories', () => new ListCategoriesService(repositories.categoriesRepository)],
		[
			'ingredients',
			() => new ListIngredientsService(repositories.ingredientsRepository, repositories.drinksRepository),
		],
		['drinks', () => new ListDrinksService(repositories.drinksRepository, storageProvider)],
	] as const)('listing the %s', (_name, makeService) => {
		it('does not show who created or last edited them', async () => {
			const records = await makeService().execute({});

			expect(records).toHaveLength(1);
			records.forEach(expectNoAuthorship);
		});
	});

	it('does not show who created or last edited the drinks found by their ingredients', async () => {
		const { items } = await new MatchDrinksService(repositories.drinksRepository, storageProvider).execute({
			ingredientIds: [seeded.ingredient.id],
			maxMissing: 'any',
		});

		expect(items).toHaveLength(1);
		expectNoAuthorship(items[0].drink);
	});

	it('does not change the records it reads', async () => {
		await new ListUnitsService(repositories.unitsRepository).execute({});

		expect(await repositories.unitsRepository.findById(seeded.unit.id)).toMatchObject({
			createdBy: FACTORY_CREATOR_ID,
		});
	});
});
