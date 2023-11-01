import AppError from '@shared/errors/AppError';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateCategoryService } from '@modules/drinks/useCases/createCategory/CreateCategory.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let createCategoryService: CreateCategoryService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt name' }
};

const translationsSameName: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt different name' }
};

describe('Create Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		createCategoryService = new CreateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to create a new category', async () => {
		await createCategoryService.execute({ translations });

		const createdCategory = await categoriesRepositoryInMemory.findByName(translations);

		expect(createdCategory).toHaveProperty('_id');
		expect(createdCategory.translations).toEqual(translations);
	});

	it('should not be able to create a category with an existing name', async () => {
		await categoriesRepositoryInMemory.create({ translations });

		await expect(createCategoryService.execute({ translations: translationsSameName })).rejects.toEqual(
			new AppError(CATEGORY_ERRORS.already_exist)
		);
	});
});
