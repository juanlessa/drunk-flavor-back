import { createCategoryFactory, resolveCategoriesRepository } from '@/core/drinks/container';
import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { DeepPartial } from '@/shared/types/utility.types';

export const createCategory = async (categoryOptions?: DeepPartial<CreateCategory>) => {
	const categoriesRepository = resolveCategoriesRepository();

	const categoryData = createCategoryFactory(categoryOptions);

	const category = await categoriesRepository.create(categoryData);
	return { ...categoryData, id: category._id.toString(), category };
};
