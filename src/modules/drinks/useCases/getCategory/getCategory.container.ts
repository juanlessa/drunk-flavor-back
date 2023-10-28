import { resolveCategoriesRepository } from '@modules/drinks/container';
import { GetCategoryService } from '@modules/drinks/useCases/getCategory/GetCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const getCategoryService = new GetCategoryService(categoriesRepository);
export const resolveGetCategoryService = () => getCategoryService;
