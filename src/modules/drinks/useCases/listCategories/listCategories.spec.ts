import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { ListCategoriesService } from '@modules/drinks/useCases/listCategories/ListCategories.service';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { ITranslations } from '@modules/drinks/types/translations';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let listCategoriesService: ListCategoriesService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt name' }
};

describe('List categories', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		listCategoriesService = new ListCategoriesService(categoriesRepositoryInMemory);
	});

	it('should be able to list all categories', async () => {
		await categoriesRepositoryInMemory.create({ translations });

		const categoriesFound = await listCategoriesService.execute();

		expect(categoriesFound.length).toEqual(1);
	});
});
