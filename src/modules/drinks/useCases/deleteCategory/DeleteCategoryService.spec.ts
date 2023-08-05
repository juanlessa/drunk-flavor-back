import AppError from '@errors/AppError';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteCategoryService } from './DeleteCategoryService';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let deleteCategoryService: DeleteCategoryService;

// test constants
const name = 'Category test';

describe('Delete category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		deleteCategoryService = new DeleteCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to delete a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ name });

		await deleteCategoryService.execute({ id: createdCategory.id });

		const findDeledCategory = await categoriesRepositoryInMemory.findById(createdCategory.id);

		expect(findDeledCategory).toBeUndefined();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteCategoryService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(CATEGORY_ERRORS.not_exist)
		);
	});
});
