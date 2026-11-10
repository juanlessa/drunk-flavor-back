import { beforeEach, describe, expect, it } from 'vitest';
import { withActor, withCreator } from '@/core/drinks/factories/authorship.factories';
import { CategoriesRepositoryInMemory } from '@/core/drinks/repositories/inMemory/Categories.repository';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '@/shared/error/error.lib';
import { DeleteCategoryService } from './DeleteCategory.service';
import { ICategoriesRepository } from '@/core/drinks/repositories/ICategories.repository';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

let categoriesRepository: ICategoriesRepository;
let service: DeleteCategoryService;

const { translations, isAlcoholic } = createCategoryFactory();

describe('Delete category', () => {
	beforeEach(() => {
		categoriesRepository = new CategoriesRepositoryInMemory();
		service = new DeleteCategoryService(categoriesRepository);
	});

	it('should be able to delete a Category', async () => {
		const createdCategory = await categoriesRepository.create(withCreator({ translations, isAlcoholic }));

		await service.execute(withActor({ id: createdCategory.id }));

		const findDeledCategory = await categoriesRepository.findById(createdCategory.id);

		expect(findDeledCategory).toBeNull();
	});

	it('should not be able to delete a nonexistent ingredient', async () => {
		const nonexistentId = new ObjectId().toString();
		await expect(service.execute(withActor({ id: nonexistentId }))).rejects.toBeInstanceOf(NotFoundError);
	});
});
