import AppError from '@errors/AppError';
import Category from '@modules/drinks/entities/Category';
import Ingredient from '@modules/drinks/entities/Ingredient';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetDrinkService } from './GetDrinkService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let getDrinkService: GetDrinkService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const ingredientName = 'Ingredient test';
const ingredientCategoryName = 'Category test';
const ingredientUnitySingular = 'ml';
const ingredientUnityPlural = 'ml';
const ingredientIsAlcoholic = true;
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Get Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		getDrinkService = new GetDrinkService(drinksRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: ingredientCategoryName });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			name: ingredientName,
			categoryId: createdCategory.id,
			unitySingular: ingredientUnitySingular,
			unityPlural: ingredientUnityPlural,
			isAlcoholic: ingredientIsAlcoholic
		});
	});

	it('should be able to find a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		const findCreatedDrink = await getDrinkService.execute({ id: createdDrink.id });

		expect(findCreatedDrink.id).toEqual(createdDrink.id);
		expect(findCreatedDrink.name).toEqual(createdDrink.name);
		expect(findCreatedDrink.method).toEqual(createdDrink.method);
	});

	it('should not be able to find a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(getDrinkService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(DRINK_ERRORS.not_found)
		);
	});
});
