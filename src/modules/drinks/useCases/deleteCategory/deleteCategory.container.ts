import { resolveCategoriesRepository } from '@modules/drinks/container';
import { DeleteCategoryService } from '@modules/drinks/useCases/deleteCategory/DeleteCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const deleteCategoryService = new DeleteCategoryService(categoriesRepository);
export const resolveDeleteCategoryService = () => deleteCategoryService;
