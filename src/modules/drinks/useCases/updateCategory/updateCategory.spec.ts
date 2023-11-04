import { CategoriesRepositoryInMemory } from '@modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'bson';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCategoryService } from '@modules/drinks/useCases/updateCategory/UpdateCategory.service';
import { ICategoryTranslation } from '@modules/drinks/entities/category.entity';
import { ITranslations } from '@modules/drinks/types/translations';
import { BadRequestError } from '@shared/errors/error.lib';

let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;
let updateCategoryService: UpdateCategoryService;

// test constants
const translations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'en name'
	},
	pt: { name: 'pt name' }
};

const updatedTranslations: ITranslations<ICategoryTranslation> = {
	en: {
		name: 'updated en name'
	},
	pt: { name: 'updated pt different name' }
};
describe('Update Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		updateCategoryService = new UpdateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to update a category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await updateCategoryService.execute({
			id: createdCategory._id,
			translations: updatedTranslations
		});

		const findUpdatedCategory = await categoriesRepositoryInMemory.findById(createdCategory._id);

		expect(findUpdatedCategory._id).toEqual(createdCategory._id);
		expect(findUpdatedCategory.translations).toEqual(updatedTranslations);
	});

	it('should not be able to update a nonexistent category', async () => {
		await expect(
			updateCategoryService.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await categoriesRepositoryInMemory.create({ translations: updatedTranslations });

		await expect(
			updateCategoryService.execute({
				id: createdCategory._id,
				translations: updatedTranslations
			})
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
