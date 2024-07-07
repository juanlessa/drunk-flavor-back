import { beforeEach, describe, expect, it } from 'vitest';
import { Category, CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ListCategoriesService } from './ListCategories.service';
import { Translations } from '@/modules/drinks/types/translations';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: ListCategoriesService;

// test constants
const translations: Translations<CategoryTranslation> = {
	en: { name: 'en name' },
	pt: { name: 'pt name' },
};

let createdCategory: Category;

describe('List Categories', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new ListCategoriesService(categoriesRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations });
	});

	it('should be able to list all categories', async () => {
		const categoriesFound = await service.execute();

		expect(categoriesFound.length).toEqual(1);
	});
});
