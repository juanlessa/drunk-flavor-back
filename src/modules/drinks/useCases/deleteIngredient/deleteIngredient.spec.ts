import AppError from '@errors/AppError';
import Category from '@modules/drinks/entities/category.entity';
import { INGREDIENT_ERRORS } from '@modules/drinks/errors/ingredient.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteIngredientService } from './deleteIngredient.service';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let deleteIngredientService: DeleteIngredientService;

// test constants
const name = 'Ingredient test';
const categoryName = 'Category test';
const unitySingular = 'ml';
const unityPlural = 'ml';
const isAlcoholic = true;
let createdCategory: Category;

describe('Delete Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		deleteIngredientService = new DeleteIngredientService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: categoryName });
	});
	it('should be able to delete an ingredient', async () => {
		const createdIngredient = await ingredientsRepositoryInMemory.create({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});

		await deleteIngredientService.execute({ id: createdIngredient.id });

		const findDeledIngredient = await ingredientsRepositoryInMemory.findById(createdIngredient.id);

		expect(findDeledIngredient).toBeUndefined();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteIngredientService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(INGREDIENT_ERRORS.not_exist)
		);
	});
});
