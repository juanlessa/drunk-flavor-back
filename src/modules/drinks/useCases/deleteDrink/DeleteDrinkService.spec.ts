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
import { DeleteDrinkService } from './DeleteDrinkService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let deleteDrinkService: DeleteDrinkService;

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

describe('Delete Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		deleteDrinkService = new DeleteDrinkService(drinksRepositoryInMemory);

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
	it('should be able to delete a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await deleteDrinkService.execute({ id: createdDrink.id });

		const findDeledDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(findDeledDrink).toBeUndefined();
	});

	it('should not be able to delete a nonexistent drink', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteDrinkService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(DRINK_ERRORS.not_exist)
		);
	});
});
