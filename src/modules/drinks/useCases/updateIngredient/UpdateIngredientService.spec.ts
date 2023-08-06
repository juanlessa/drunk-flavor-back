import AppError from '@errors/AppError';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateIngredientService } from './UpdateIngredientService';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import Category from '@modules/drinks/entities/Category';
import Ingredient from '@modules/drinks/entities/Ingredient';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let updateIngredientService: UpdateIngredientService;

// test constants
const name = 'Ingredient test';
const categoryName = 'Category test';
const unitySingular = 'ml';
const unityPlural = 'ml';
const isAlcoholic = true;
const updatedName = 'Updated ingredient';
const updatedUnitySingular = 'oz';
const updatedUnityPlural = 'oz';
const updatedIsAlcoholic = false;
let createdCategory: Category;
let createdIngredient: Ingredient;

describe('Update Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		updateIngredientService = new UpdateIngredientService(
			ingredientsRepositoryInMemory,
			categoriesRepositoryInMemory
		);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: categoryName });
		createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});
	});

	it('should be able to update an ingredient', async () => {
		await updateIngredientService.execute({
			id: createdIngredient.id,
			name: updatedName,
			categoryId: createdCategory.id,
			unitySingular: updatedUnitySingular,
			unityPlural: updatedUnityPlural,
			isAlcoholic: updatedIsAlcoholic
		});

		const findUpdatedIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient.id);

		expect(findUpdatedIngredient.name).toEqual(updatedName);
		expect(findUpdatedIngredient.categoryId).toEqual(createdCategory.id);
		expect(findUpdatedIngredient.unitySingular).toEqual(updatedUnitySingular);
		expect(findUpdatedIngredient.unityPlural).toEqual(updatedUnityPlural);
	});

	it('should not be able to update a nonexistent ingredient', async () => {
		await expect(
			updateIngredientService.execute({
				id: new ObjectId().toString(),
				name: updatedName,
				categoryId: createdCategory.id,
				unitySingular: updatedUnitySingular,
				unityPlural: updatedUnityPlural,
				isAlcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.not_exist));
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			name: updatedName,
			categoryId: createdCategory.id,
			unitySingular: updatedUnitySingular,
			unityPlural: updatedUnityPlural,
			isAlcoholic: updatedIsAlcoholic
		});

		await expect(
			updateIngredientService.execute({
				id: createdIngredient.id,
				name: updatedName,
				categoryId: createdCategory.id,
				unitySingular: updatedUnitySingular,
				unityPlural: updatedUnityPlural,
				isAlcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.already_exist));
	});

	it('should not be able to update an ingredient to a nonexistent category', async () => {
		await expect(
			updateIngredientService.execute({
				id: createdIngredient.id,
				name: updatedName,
				categoryId: new ObjectId().toString(),
				unitySingular: updatedUnitySingular,
				unityPlural: updatedUnityPlural,
				isAlcoholic: updatedIsAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.invalid_category_id_format));
	});
});
