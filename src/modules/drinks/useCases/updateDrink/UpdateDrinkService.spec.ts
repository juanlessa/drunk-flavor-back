import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkService } from './UpdateDrinkService';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { Category, Ingredient } from '@prisma/client';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkService: UpdateDrinkService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const ingredientName = 'Ingredient test';
const ingredientCategoryName = 'Category test';
const ingredientUnitySingular = 'ml';
const ingredientUnityPlural = 'ml';
const ingredientIsAlcoholic = true;
const updatedName = 'Updated drink name';
const updatedMethod = 'Updated drink recept ...';
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Update Drink', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkService = new UpdateDrinkService(drinksRepositoryInMemory, ingredientsRepositoryInMemory);

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

	it('should be able to update a drink', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkService.execute({
			id: createdDrink.id,
			name: updatedName,
			method: updatedMethod,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 15 }]
		});

		const findUpdatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(findUpdatedDrink.name).toEqual(updatedName);
		expect(findUpdatedDrink.method).toEqual(updatedMethod);
	});

	it('should not be able to update a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: nonexistentDrinkId,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.not_exist));
	});

	it('should not be able to update drink name to an already existing name', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});
		await drinksRepositoryInMemory.create({
			name: updatedName,
			method: updatedMethod,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
		});

		await expect(
			updateDrinkService.execute({
				id: createdDrink.id,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: createdIngredient.id, quantity: 12 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.name_already_exit));
	});

	it('should not be able to update a drink to add a nonexistent ingredient', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});
		const nonexistentIngredientId = new ObjectId().toString();

		await expect(
			updateDrinkService.execute({
				id: createdDrink.id,
				name: updatedName,
				method: updatedMethod,
				ingredients: [{ ingredientId: nonexistentIngredientId, quantity: 12 }]
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.some_ingredients_not_exist));
	});
});
