import { beforeEach, describe, expect, it } from 'vitest';
import { ObjectId } from 'mongodb';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { IngredientsRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Ingredients.repository';
import { GetDrinkService } from './GetDrink.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { createCategoryFactory, createDrinkFactory, createIngredientFactory } from '@/core/drinks/container';
import { IDrinksRepository } from '@/core/drinks/repositories/IDrinks.repository';
import { IStorageProvider } from '@/shared/providers/storage/IStorage.provider';
import { DrinksRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Drinks.repository';
import { LocalStorageProvider } from '@/shared/providers/storage/implementations/LocalStorage.provider';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';

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
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory();
		storageProvider = new LocalStorageProvider();
		drinksRepositoryInMemory = new DrinksRepositoryInMemory();
		service = new GetDrinkService(drinksRepositoryInMemory, storageProvider);

		const category = await categoriesRepositoryInMemory.create({ translations: translationsCategory });
		ingredient = await ingredientsRepositoryInMemory.create({
			translations: translationsIngredient,
			is_alcoholic: false,
			category: category,
		});
	});
	it('should be able to find an Drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			translations,
			ingredients: [{ ingredient: ingredient, quantity: 30 }],
		});

		const drinkFound = await service.execute({ id: createdDrink._id.toString() });

		expect(drinkFound._id).toEqual(createdDrink._id);
		expect(drinkFound.translations).toEqual(createdDrink.translations);
		expect(drinkFound.ingredients.length).toEqual(1);
	});

	it('should not be able to find a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
