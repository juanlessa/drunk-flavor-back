import { ICategory, ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListCategoriesService } from '@modules/drinks/useCases/listCategories/listCategories.service';
import { ITranslations } from '@modules/drinks/types/translations';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let listCategoriesService: ListCategoriesService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: { name: 'en name' },
	pt: { name: 'pt name' }
};

let createdCategory: ICategory;

describe('List Categories', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		listCategoriesService = new ListCategoriesService(categoriesRepositoryInMemory);

		// test constants
		createdCategory = await categoriesRepositoryInMemory.create({ translations });
	});

	it('should be able to list all categories', async () => {
		const categoriesFound = await listCategoriesService.execute();

		expect(categoriesFound.length).toEqual(1);
	});
});
