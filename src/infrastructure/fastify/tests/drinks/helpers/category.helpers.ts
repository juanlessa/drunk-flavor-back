import { CreateCategory } from '@/core/drinks/dtos/category.dtos';
import { createCategoryFactory } from '@/core/drinks/factories/category.factories';
import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';

export const createCategory = async (categoryOptions?: DeepPartial<CreateCategory>) => {
	const categoryData = createCategoryFactory(categoryOptions);
	const category = await resolveCategoriesRepository().create(categoryData);
	return { ...categoryData, id: category.id, category };
};
