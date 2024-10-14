import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { CreateCategoryService } from './CreateCategory.service';
import { Category } from '@/core/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: CreateCategoryService;

const { translations } = createCategoryFactory();

describe('Create Category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new CreateCategoryService(categoriesRepository);
	});

	it('should be able to create a new category', async () => {
		await service.execute({ translations });

		const createdCategory = (await categoriesRepository.findByName(translations)) as Category;

		expect(createdCategory).toHaveProperty('_id');
	});

	it('should not be able to create a category with an existing name', async () => {
		await categoriesRepository.create({ translations });

		await expect(service.execute({ translations })).rejects.toBeInstanceOf(BadRequestError);
	});
});
