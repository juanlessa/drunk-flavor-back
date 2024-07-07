import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { CreateCategoryService } from './CreateCategory.service';
import { Translations } from '@/modules/drinks/types/translations';
import { Category, CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: CreateCategoryService;

// test constants
const translations: Translations<CategoryTranslation> = {
	en: {
		name: 'en name',
	},
	pt: { name: 'pt name' },
};

const translationsConflictingName: Translations<CategoryTranslation> = {
	en: {
		name: 'en name',
	},
	pt: { name: 'pt different name' },
};

describe('Create Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new CreateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to create a new category', async () => {
		await service.execute({ translations });

		const createdCategory = (await categoriesRepositoryInMemory.findByName(translations)) as Category;

		expect(createdCategory).toHaveProperty('_id');
		expect(createdCategory.translations).toEqual(translations);
	});

	it('should not be able to create a category with an existing name', async () => {
		await categoriesRepositoryInMemory.create({ translations });

		await expect(service.execute({ translations: translationsConflictingName })).rejects.toBeInstanceOf(
			BadRequestError,
		);
	});
});
