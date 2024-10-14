import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { GetDrinkService } from './GetDrink.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { MockStorageProvider } from '@/shared/providers/storage/implementations/MockStorage.provider';

let categoriesRepositoryInMemory: ICategoriesRepository;
let ingredientsRepositoryInMemory: IIngredientsRepository;
let drinksRepositoryInMemory: IDrinksRepository;
let storageProvider: IStorageProvider;
let service: GetDrinkService;

const { translations: translationsCategory } = createCategoryFactory();

const { translations: translationsIngredient } = createIngredientFactory();

const { translations } = createDrinkFactory({
	translations: { en: { name: 'Cosmopolitan' }, pt: { name: 'Cosmopolitan' } },
});

let ingredient: Ingredient;

describe('Get Drink', () => {
	beforeEach(async () => {
		vi.clearAllMocks();

		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		storageProvider = new MockStorageProvider();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		service = new GetDrinkService(drinksRepositoryInMemory, storageProvider);

		const category = await categoriesRepositoryInMemory.create({ translations: translationsCategory });
		ingredient = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient,
			is_alcoholic: false,
			category: category,
		});
	});

	afterAll(async () => {
		vi.clearAllMocks();
	});

	it('should be able to find a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: ingredient, quantity: 30 }],
		});

		const drinkFound = await service.execute({ id: createdDrink._id.toString() });

		expect(drinkFound).toBeDefined();
		expect(drinkFound._id).toEqual(createdDrink._id);
	});

	it('should not be able to find a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should be able to add the cover and thumbnail url to a found drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: ingredient, quantity: 30 }],
		});
		await drinksRepositoryInMemory.update({
			id: createdDrink._id.toString(),
			cover: { name: 'coverFile.png', mimetype: 'image/png', url: '' },
			thumbnail: { name: 'thumbnailFile.jpeg', mimetype: 'image/jpeg', url: '' },
		});

		const drinkFound = await service.execute({ id: createdDrink._id.toString() });

		expect(drinkFound).toBeDefined();
		expect(storageProvider.getFileURL).toHaveBeenCalledTimes(2);
	});
});
