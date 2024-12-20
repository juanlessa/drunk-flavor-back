import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { GetCategoryService } from './GetCategory.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: GetCategoryService;

const { translations } = createCategoryFactory();

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new GetCategoryService(categoriesRepository);
	});
	it('should be able to find a Category', async () => {
		const createdCategory = await categoriesRepository.create({ translations });

		const categoryFound = await service.execute({ id: createdCategory._id.toString() });

		expect(categoryFound._id).toEqual(createdCategory._id);
		expect(categoryFound.translations).toEqual(createdCategory.translations);
	});

	it('should not be able to find a nonexistent category', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
