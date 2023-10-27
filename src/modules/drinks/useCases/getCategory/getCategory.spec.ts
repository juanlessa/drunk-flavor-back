import AppError from '@shared/errors/AppError';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { GetCategoryService } from './GetCategory.service';
import { ITranslations } from '@modules/drinks/types/translations';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let getCategoryService: GetCategoryService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt name' }
};

describe('Get Ingredient', () => {
	beforeEach(async () => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		getCategoryService = new GetCategoryService(categoriesRepositoryInMemory);
	});
	it('should be able to find a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		const categoryFound = await getCategoryService.execute({ id: createdCategory._id });

		expect(categoryFound._id).toEqual(createdCategory._id);
		expect(categoryFound.translations).toEqual(createdCategory.translations);
	});

	it('should not be able to find a nonexistent category', async () => {
		const nonexistentId = new ObjectId().toString();

		await expect(getCategoryService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(CATEGORY_ERRORS.not_found)
		);
	});
});
