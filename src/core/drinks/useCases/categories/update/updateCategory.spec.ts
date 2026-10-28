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

const { translations, isAlcoholic } = createCategoryFactory({ isAlcoholic: true });
const { translations: updatedTranslations, isAlcoholic: updatedIsAlcoholic } = createCategoryFactory({
	translations: { en: { name: 'Juice' }, pt: { name: 'Suco' } },
	isAlcoholic: false,
});

describe('Update Category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new UpdateCategoryService(categoriesRepository);
	});

	it('should be able to update a category', async () => {
		const createdCategory = await categoriesRepository.create({ translations, isAlcoholic });

		await service.execute({
			id: createdCategory.id,
			translations: updatedTranslations,
			isAlcoholic: updatedIsAlcoholic,
		});

		const findUpdatedCategory = (await categoriesRepository.findById(createdCategory.id)) as Category;

		expect(findUpdatedCategory.id).toEqual(createdCategory.id);
		expect(findUpdatedCategory.translations).toEqual(updatedTranslations);
		expect(findUpdatedCategory.isAlcoholic).toEqual(updatedIsAlcoholic);
	});

	it('should not be able to update a nonexistent category', async () => {
		await expect(
			service.execute({
				id: new ObjectId().toString(),
				translations: updatedTranslations,
				isAlcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});

	it('should not be able to update an ingredient name to an existing name', async () => {
		const createdCategory = await categoriesRepository.create({ translations, isAlcoholic });

		await categoriesRepository.create({ translations: updatedTranslations, isAlcoholic: updatedIsAlcoholic });

		await expect(
			service.execute({
				id: createdCategory.id,
				translations: updatedTranslations,
				isAlcoholic: updatedIsAlcoholic,
			}),
		).rejects.toBeInstanceOf(BadRequestError);
	});
});
