import AppError from '@errors/AppError';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import { ObjectId } from 'bson';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCategoryService } from './updateCategory.service';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let updateCategoryService: UpdateCategoryService;

// test constants
const name = 'Category test';
const updatedName = 'Updated category test';

describe('Update Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		updateCategoryService = new UpdateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to update a category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ name });

		await updateCategoryService.execute({
			id: createdCategory.id,
			name: updatedName
		});

		const findUpdatedCategory = await categoriesRepositoryInMemory.findById(createdCategory.id);

		expect(findUpdatedCategory.id).toEqual(createdCategory.id);
		expect(findUpdatedCategory.name).toEqual(updatedName);
	});

	it('should not be able to update a nonexistent category', async () => {
		await expect(
			updateCategoryService.execute({
				id: new ObjectId().toString(),
				name: updatedName
			})
		).rejects.toEqual(new AppError(CATEGORY_ERRORS.not_exist));
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ name });

		await categoriesRepositoryInMemory.create({ name: updatedName });

		await expect(
			updateCategoryService.execute({
				id: createdCategory.id,
				name: updatedName
			})
		).rejects.toEqual(new AppError(CATEGORY_ERRORS.already_exist));
	});
});
