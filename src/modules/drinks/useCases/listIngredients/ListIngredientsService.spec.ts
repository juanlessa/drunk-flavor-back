import Category from '@modules/drinks/entities/Category';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { IngredientsRepositoryInMemory } from '@modules/drinks/repositories/inMemory/IngredientsRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListIngredientsService } from './ListIngredientsService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let ingredientsRepositoryInMemory: IngredientsRepositoryInMemory;
let listIngredientsService: ListIngredientsService;

// test constants
const name = 'Ingredient test';
const categoryName = 'Category test';
const unitySingular = 'ml';
const unityPlural = 'ml';
const isAlcoholic = true;
let createdCategory: Category;

describe('List Ingredients', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		ingredientsRepositoryInMemory = new IngredientsRepositoryInMemory(categoriesRepositoryInMemory);
		listIngredientsService = new ListIngredientsService(ingredientsRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ name: categoryName });
	});

	it('should be able to list all ingredients', async () => {
		await ingredientsRepositoryInMemory.create({
			name,
			categoryId: createdCategory.id,
			unitySingular,
			unityPlural,
			isAlcoholic
		});

		const ingredientsFound = await listIngredientsService.execute();

		expect(ingredientsFound.length).toEqual(1);
	});
});
