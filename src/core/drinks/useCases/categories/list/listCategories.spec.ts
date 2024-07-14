import { beforeEach, describe, expect, it } from 'vitest';
import { Category, CategoryTranslation } from '@/core/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ListCategoriesService } from './ListCategories.service';
import { Translations } from '@/core/drinks/types/translations';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/container';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: ListCategoriesService;

const { translations } = createCategoryFactory();

describe('List Categories', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new ListCategoriesService(categoriesRepositoryInMemory);
	});

	it('should be able to list all categories', async () => {
		await categoriesRepositoryInMemory.create({ translations });

		const categoriesFound = await service.execute();

		expect(categoriesFound.length).toEqual(1);
	});
});
