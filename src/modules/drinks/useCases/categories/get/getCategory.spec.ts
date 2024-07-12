import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { GetCategoryService } from './GetCategory.service';
import { Translations } from '@/modules/drinks/types/translations';
import { CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/modules/drinks/container';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: GetCategoryService;

const { translations } = createCategoryFactory();

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new GetCategoryService(categoriesRepositoryInMemory);
	});
	it('should be able to find a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		const categoryFound = await service.execute({ id: createdCategory._id.toString() });

		expect(categoryFound._id).toEqual(createdCategory._id);
		expect(categoryFound.translations).toEqual(createdCategory.translations);
	});

	it('should not be able to find a nonexistent category', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
