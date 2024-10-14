import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { DeepPartial } from '@/shared/types/utility.types';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';

export const createCategory = async (categoryOptions?: DeepPartial<CreateCategory>) => {
	const categoriesRepository = resolveCategoriesRepository();

	const categoryData = createCategoryFactory(categoryOptions);

	const category = await categoriesRepository.create(categoryData);
	return { ...categoryData, id: category._id.toString(), category };
};
