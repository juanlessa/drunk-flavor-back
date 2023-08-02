import AppError from '@errors/AppError';
import Category from '@modules/drinks/entities/Category';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredientErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateIngredientService } from './CreateIngredientService';

let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let createIngredientService: CreateIngredientService;

// test constants
const name = 'Ingredient test';
const unitySingular = 'ml';
const unityPlural = 'ml';
const isAlcoholic = true;

const categoryName = 'Test category name';
let createdCategory: Category;

describe('Create Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		createIngredientService = new CreateIngredientService(
			ingredientsRepositoryInMemory,
			categoriesRepositoryInMemory
		);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: categoryName });
	});

	it('should be able to create a new ingredient', async () => {
		await createIngredientService.execute({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});

		const createdIngredient = await ingredientsRepositoryInMemory.findByName(name);

		expect(createdIngredient).toHaveProperty('id');
		expect(createdIngredient.name).toEqual(name);
		expect(createdIngredient.categoryId).toEqual(createdCategory.id);
		expect(createdIngredient.unitySingular).toEqual(unitySingular);
		expect(createdIngredient.unityPlural).toEqual(unityPlural);
		expect(createdIngredient.isAlcoholic).toEqual(isAlcoholic);
	});

	it('should not be able to create an ingredient with an existing name', async () => {
		await ingredientsRepositoryInMemory.create({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});

		await expect(
			createIngredientService.execute({
				name,
				categoryId: createdCategory.id,
				unitySingular,
				unityPlural,
				isAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.already_exist));
	});

	it('should not be able to create a ingredient with a nonexistent category', async () => {
		await expect(
			createIngredientService.execute({
				name,
				categoryId: new ObjectId().toString(),
				unitySingular,
				unityPlural,
				isAlcoholic
			})
		).rejects.toEqual(new AppError(INGREDIENT_ERRORS.invalid_category_id_format));
	});
});
