import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCategoryService } from './UpdateCategory.service';
import { Category } from '@/modules/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/modules/drinks/container';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: UpdateCategoryService;

const { translations } = createCategoryFactory();
const { translations: updatedTranslations } = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});

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
