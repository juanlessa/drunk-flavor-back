import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCategoryService } from './UpdateCategory.service';
import { Category, CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { Translations } from '@/modules/drinks/types/translations';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: UpdateCategoryService;

// test constants
const translations: Translations<CategoryTranslation> = {
	en: {
		name: 'en name',
	},
	pt: { name: 'pt name' },
};

const updatedTranslations: Translations<CategoryTranslation> = {
	en: {
		name: 'updated en name',
	},
	pt: { name: 'updated pt different name' },
};
describe('Update Category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new UpdateCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to update a category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await service.execute({
			id: createdCategory._id.toString(),
			translations: updatedTranslations,
		});

		const findUpdatedCategory = (await categoriesRepositoryInMemory.findById(
			createdCategory._id.toString(),
		)) as Category;

		expect(findUpdatedCategory._id).toEqual(createdCategory._id);
		expect(findUpdatedCategory.translations).toEqual(updatedTranslations);
	});

	it('should not be able to update a nonexistent category', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await categoriesRepositoryInMemory.create({ translations: updatedTranslations });

		await expect(
			service.execute({
				id: createdCategory._id.toString(),
				translations: updatedTranslations,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
