import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateCategoryService } from './UpdateCategory.service';
import { Category } from '@/core/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: UpdateCategoryService;

const { translations } = createCategoryFactory();
const { translations: updatedTranslations } = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
});

describe('Update Category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new UpdateCategoryService(categoriesRepository);
	});

	it('should be able to update a category', async () => {
		const createdCategory = await categoriesRepository.create({ translations });

		await service.execute({
			id: createdCategory._id.toString(),
			translations: updatedTranslations,
		});

		const findUpdatedCategory = (await categoriesRepository.findById(createdCategory._id.toString())) as Category;

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
		const createdCategory = await categoriesRepository.create({ translations });

		await categoriesRepository.create({ translations: updatedTranslations });

		await expect(
			service.execute({
				id: createdCategory._id.toString(),
				translations: updatedTranslations,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
