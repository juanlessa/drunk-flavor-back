import { resolveCategoriesRepository } from '@/core/drinks/container';
import { DeleteCategoryService } from './DeleteCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const deleteCategoryService = new DeleteCategoryService(categoriesRepository);
export const resolveDeleteCategoryService = () => deleteCategoryService;
