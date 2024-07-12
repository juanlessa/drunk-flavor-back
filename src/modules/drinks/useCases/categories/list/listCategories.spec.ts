import { beforeEach, describe, expect, it } from 'vitest';
import { Category, CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ListCategoriesService } from './ListCategories.service';
import { Translations } from '@/modules/drinks/types/translations';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/modules/drinks/container';

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
