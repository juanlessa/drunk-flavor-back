import { beforeEach, describe, expect, it } from 'vitest';
import { withActor, withCreator } from '@/core/drinks/factories/authorship.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { CreateCategoryService } from './CreateCategory.service';
import { Category } from '@/core/drinks/entities/category.entity';
import { ConflictError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: CreateCategoryService;

const { translations, isAlcoholic } = createCategoryFactory({ isAlcoholic: true });

describe('Create Category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new CreateCategoryService(categoriesRepository);
	});

	it('should be able to create a new category', async () => {
		await service.execute(withActor({ translations, isAlcoholic }));

		const createdCategory = (await categoriesRepository.findByName(translations)) as Category;

		expect(createdCategory).toHaveProperty('id');
		expect(createdCategory.isAlcoholic).toEqual(isAlcoholic);
	});

	it('should not be able to create a category with an existing name', async () => {
		await categoriesRepository.create(withCreator({ translations, isAlcoholic }));

		await expect(service.execute(withActor({ translations, isAlcoholic }))).rejects.toBeInstanceOf(ConflictError);
	});
});
