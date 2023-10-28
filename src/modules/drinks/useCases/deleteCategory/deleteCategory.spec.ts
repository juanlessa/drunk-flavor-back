import AppError from '@shared/errors/AppError';
import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'bson';
import { CATEGORY_ERRORS } from '@modules/drinks/errors/category.errors';
import { ITranslations } from '@modules/drinks/types/translations';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteCategoryService } from '@modules/drinks/useCases/deleteCategory/DeleteCategory.service';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let deleteCategoryService: DeleteCategoryService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt name' }
};

describe('Delete category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		deleteCategoryService = new DeleteCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to delete a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await deleteCategoryService.execute({ id: createdCategory._id });

		const findDeledCategory = await categoriesRepositoryInMemory.findById(createdCategory._id);

		expect(findDeledCategory).toBeUndefined();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(deleteCategoryService.execute({ id: nonexistentId })).rejects.toEqual(
			new AppError(CATEGORY_ERRORS.not_exist)
		);
	});
});
