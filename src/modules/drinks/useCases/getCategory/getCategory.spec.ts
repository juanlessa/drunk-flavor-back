import AppError from '@errors/AppError';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetCategoryService } from './getCategory.service';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let getCategoryService: GetCategoryService;

// test constants
const name = 'Category test';

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		getCategoryService = new GetCategoryService(categoriesRepositoryInMemory);
	});
	it('should be able to find a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ name });

		const categoryFound = await getCategoryService.execute({ id: createdCategory.id });

		expect(categoryFound.id).toEqual(createdCategory.id);
		expect(categoryFound.name).toEqual(createdCategory.name);
	});

	it('should not be able to find a nonexistent category', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(getCategoryService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(CATEGORY_ERRORS.not_found)
		);
	});
});
