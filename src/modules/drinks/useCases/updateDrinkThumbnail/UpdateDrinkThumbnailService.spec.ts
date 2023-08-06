import AppError from '@errors/AppError';
import { ICreateIngredient } from '@modules/drinks/dtos/ingredients';
import { DrinksRepositoryInMemory } from '@modules/drinks/repositories/inMemory/DrinksRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateDrinkThumbnailService } from './UpdateDrinkThumbnailService';
import { DRINK_ERRORS } from '@modules/drinks/errors/drinkErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import Ingredient from '@modules/drinks/entities/Ingredient';
import Category from '@modules/drinks/entities/Category';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let drinksRepositoryInMemory: DrinksRepositoryInMemory;
let updateDrinkThumbnailService: UpdateDrinkThumbnailService;

// test constants
const name = 'Drink test name';
const method = 'drink recept...';
const thumbnailFileName = 'Test-thumbnail-file.png';
const ingredientName = 'Ingredient test';
const ingredientCategoryName = 'Category test';
const ingredientUnitySingular = 'ml';
const ingredientUnityPlural = 'ml';
const ingredientIsAlcoholic = true;
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Update Drink Thumbnail', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		drinksRepositoryInMemory = new DrinksRepositoryInMemory(ingredientsRepositoryInMemory);
		updateDrinkThumbnailService = new UpdateDrinkThumbnailService(drinksRepositoryInMemory);

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

	it('should be able to update a drink thumbnail', async () => {
		const createdDrink = await drinksRepositoryInMemory.create({
			name,
			method,
			ingredients: [{ ingredientId: createdIngredient.id, quantity: 60 }]
		});

		await updateDrinkThumbnailService.execute({
			drinkId: createdDrink.id,
			thumbnailFile: thumbnailFileName
		});

		const updatedDrink = await drinksRepositoryInMemory.findById(createdDrink.id);

		expect(updatedDrink.thumbnail).toEqual(thumbnailFileName);
		expect(updatedDrink.id).toEqual(createdDrink.id);
	});

	it('should not be able to update the thumbnail of a nonexistent drink', async () => {
		const nonexistentDrinkId = new ObjectId().toString();

		await expect(
			updateDrinkThumbnailService.execute({
				drinkId: nonexistentDrinkId,
				thumbnailFile: thumbnailFileName
			})
		).rejects.toEqual(new AppError(DRINK_ERRORS.not_exist));
	});
});
