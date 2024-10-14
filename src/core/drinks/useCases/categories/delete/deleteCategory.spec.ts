import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { BadRequestError } from '@/shared/error/error.lib';
import { DeleteCategoryService } from './DeleteCategory.service';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: DeleteCategoryService;

const { translations } = createCategoryFactory();

describe('Delete category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new DeleteCategoryService(categoriesRepository);
	});

	it('should be able to delete a Category', async () => {
		const createdCategory = await categoriesRepository.create({ translations });

		await service.execute({ id: createdCategory._id.toString() });

		const findDeledCategory = await categoriesRepository.findById(createdCategory._id.toString());

		expect(findDeledCategory).toBeNull();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
