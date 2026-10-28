import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { GetCategoryService } from './GetCategory.service';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: GetCategoryService;

const { translations, isAlcoholic } = createCategoryFactory({ isAlcoholic: true });

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new GetCategoryService(categoriesRepository);
	});
	it('should be able to find a Category', async () => {
		const createdCategory = await categoriesRepository.create({ translations, isAlcoholic });

		const categoryFound = await service.execute({ id: createdCategory.id });

		expect(categoryFound.id).toEqual(createdCategory.id);
		expect(categoryFound.translations).toEqual(createdCategory.translations);
		expect(categoryFound.isAlcoholic).toEqual(isAlcoholic);
	});

	it('should not be able to find a nonexistent category', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
