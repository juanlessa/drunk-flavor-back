import { resolveCategoriesRepository } from '@/modules/drinks/container';
import { DeleteCategoryService } from './DeleteCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const deleteCategoryService = new DeleteCategoryService(categoriesRepository);
export const resolveDeleteCategoryService = () => deleteCategoryService;
