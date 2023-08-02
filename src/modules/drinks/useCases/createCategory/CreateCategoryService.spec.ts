import AppError from '@errors/AppError';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/categoryErrors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCategoryService } from './CreateCategoryService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let createCategoryService: CreateCategoryService;

// test constants
const name = 'Category test';

describe('Create Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		createCategoryService = new CreateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to create a new category', async () => {
		await createCategoryService.execute({ name });

		const createdCategory = await categoriesRepositoryInMemory.findByName(name);

		expect(createdCategory).toHaveProperty('id');
		expect(createdCategory.name).toEqual(name);
	});

	it('should not be able to create a category with an existing name', async () => {
		await categoriesRepositoryInMemory.create({
			name
		});

		await expect(
			createCategoryService.execute({
				name
			})
		).rejects.toEqual(new AppError(CATEGORY_ERRORS.already_exist));
	});
});
