import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/CategoriesRepository';
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListCategoriesService } from './ListCategoriesService';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let listCategoriesService: ListCategoriesService;

// test constants
const name = 'Category test';

describe('List categories', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		listCategoriesService = new ListCategoriesService(categoriesRepositoryInMemory);
	});

	it('should be able to list all categories', async () => {
		await categoriesRepositoryInMemory.create({ name });

		const categoriesFound = await listCategoriesService.execute();

		expect(categoriesFound.length).toEqual(1);
	});
});
