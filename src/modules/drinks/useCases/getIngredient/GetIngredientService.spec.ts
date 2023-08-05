import AppError from '@errors/AppError';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { Category } from '@prisma/client';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetIngredientService } from './GetIngredientService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let getIngredientService: GetIngredientService;

// test constants
const name = 'Ingredient test';
const categoryName = 'Category test';
const unitySingular = 'ml';
const unityPlural = 'ml';
const isAlcoholic = true;
let createdCategory: Category;

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		getIngredientService = new GetIngredientService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: categoryName });
	});
	it('should be able to find an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});

		const ingredientFound = await getIngredientService.execute({ id: createdIngredient.id });

		expect(ingredientFound.id).toEqual(createdIngredient.id);
		expect(ingredientFound.name).toEqual(createdIngredient.name);
		expect(ingredientFound.categoryId).toEqual(createdIngredient.categoryId);
		expect(ingredientFound.unitySingular).toEqual(createdIngredient.unitySingular);
		expect(ingredientFound.unityPlural).toEqual(createdIngredient.unityPlural);
		expect(ingredientFound.isAlcoholic).toEqual(createdIngredient.isAlcoholic);
	});

	it('should not be able to find a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(getIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(INGREDIENT_ERRORS.not_found)
		);
	});
});
