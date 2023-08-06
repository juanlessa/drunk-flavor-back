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
import { UpdateDrinkCoverService } from './UpdateDrinkCoverService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkCoverService: UpdateDrinkCoverService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const coverFileName = 'Test-cover-file.png';
const ingredientName = 'Ingredient test';
const ingredientCategoryName = 'Category test';
const ingredientUnitySingular = 'ml';
const ingredientUnityPlural = 'ml';
const ingredientIsAlcoholic = true;
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Update Drink Cover', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkCoverService = new UpdateDrinkCoverService(drinksRepositoryInMemory);

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

	it('should be able to update a drink cover', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkCoverService.execute({
			drinkId: createdDrink.id,
			coverFile: coverFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(updatedDrink.cover).toEqual(coverFileName);
		expect(updatedDrink.id).toEqual(createdDrink.id);
	});

	it('should not be able to update the cover of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkCoverService.execute({
				drinkId: nonexistentDrinkId,
				coverFile: coverFileName
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.not_exist));
	});
});
