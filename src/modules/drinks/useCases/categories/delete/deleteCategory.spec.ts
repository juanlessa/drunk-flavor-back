import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesRepositoryInMemory } from '@/modules/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { Translations } from '@/modules/drinks/types/translations';
import { CategoryTranslation } from '@/modules/drinks/entities/category.entity';
import { BadRequestError } from '@/shared/error/error.lib';
import { DeleteCategoryService } from './DeleteCategory.service';
import { ICategoriesRepository } from '@/modules/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/modules/drinks/container';

let categoriesRepositoryInMemory: ICategoriesRepository;
let service: DeleteCategoryService;

const { translations } = createCategoryFactory();

describe('Delete category', () => {
	beforeEach(() => {
		categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
		service = new DeleteCategoryService(categoriesRepositoryInMemory);
	});

	it('should be able to delete a Category', async () => {
		const createdCategory = await categoriesRepositoryInMemory.create({ translations });

		await service.execute({ id: createdCategory._id.toString() });

		const findDeledCategory = await categoriesRepositoryInMemory.findById(createdCategory._id.toString());

		expect(findDeledCategory).toBeNull();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute({ id: nonexistentId })).rejects.toBeInstanceOf(BadRequestError);
	});
});
