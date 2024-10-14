import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { ListDrinksService } from './ListDrinks.service';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { DEFAULT_QUERY_PARAMS } from '@/shared/constants/query.constants';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { Drink } from '@/core/drinks/entities/drink.entity';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let drinksRepositoryInMemory: IDrinksRepository;
let storageProvider: IStorageProvider;
let service: ListDrinksService;

const createCategory1 = createCategoryFactory({
	translations: { en: { name: 'Syrup' }, pt: { name: 'Xarope' } },
});

const { translations: translationsIngredient1 } = createIngredientFactory({
	translations: { en: { name: 'Orange syrup' }, pt: { name: 'Xarope de laranja' } },
});
const { translations: translationsIngredient2 } = createIngredientFactory({
	translations: { en: { name: 'Lime Syrup' }, pt: { name: 'Xarope de limão' } },
});
const { translations: translationsDrink1 } = createDrinkFactory({
	translations: { en: { name: 'Cosmopolitan' }, pt: { name: 'Cosmopolitan' } },
});
const { translations: translationsDrink2 } = createDrinkFactory({
	translations: { en: { name: 'Paper plane' }, pt: { name: 'Paper plane' } },
});
const { translations: translationsDrink3 } = createDrinkFactory({
	translations: { en: { name: 'Tequila sunrise' }, pt: { name: 'Tequila sunrise' } },
});

let createdDrink1: Drink;

describe('List Drinks', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		service = new ListDrinksService(drinksRepositoryInMemory, storageProvider);

		const category1 = await categoriesRepositoryInMemory.create(createCategory1);
		const ingredient1 = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient1,
			is_alcoholic: false,
			category: category1,
		});
		const ingredient2 = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient2,
			is_alcoholic: false,
			category: category1,
		});
		createdDrink1 = await drinksRepositoryInMemory.create({
			translations: translationsDrink1,
			ingredients: [{ ingredient: ingredient1, quantity: 60 }],
		});
		await drinksRepositoryInMemory.create({
			translations: translationsDrink2,
			ingredients: [{ ingredient: ingredient2, quantity: 60 }],
		});
		await drinksRepositoryInMemory.create({
			translations: translationsDrink3,
			ingredients: [
				{ ingredient: ingredient1, quantity: 30 },
				{ ingredient: ingredient2, quantity: 30 },
			],
		});
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to list drinks', async () => {
		const found = await service.execute({});

		expect(found.length).greaterThan(0);
		expect(found.length).lessThanOrEqual(DEFAULT_QUERY_PARAMS.limit);
	});

	it('should be able to list drinks using pagination', async () => {
		const found = await service.execute({ query: { page: 1, limit: 3 } });

		expect(found.length).toEqual(3);
	});

	it('should be able to list drinks using search term', async () => {
		const found = await service.execute({ query: { search: { 'translations.en.name': 'Cosmopolitan' } } });

		expect(found.length).toEqual(1);
	});

	it('should be able to list drinks using sort', async () => {
		const found = await service.execute({
			query: { limit: 2, page: 1, sort: { 'translations.en.name': -1 } },
		});

		expect(found.length).toEqual(2);
		expect(found[0].translations.en.name).toEqual(translationsDrink3.en.name);
		expect(found[1].translations.en.name).toEqual(translationsDrink2.en.name);
	});

	it('should be able to add the cover and thumbnail url to the found drinks', async () => {
		await drinksRepositoryInMemory.update({
			id: createdDrink1._id.toString(),
			cover: { name: 'coverFile.png', mimetype: 'image/png', url: '' },
			thumbnail: { name: 'thumbnailFile.jpeg', mimetype: 'image/jpeg', url: '' },
		});

		const drinksFound = await service.execute({ query: { limit: 3, page: 1 } });

		expect(drinksFound.length).toBe(3);
		expect(storageProvider.getFileURL).toHaveBeenCalledTimes(2);
	});
});
