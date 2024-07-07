import { resolveCategoriesRepository } from '@/modules/drinks/container';
import { CreateCategoryService } from './CreateCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const createCategoryService = new CreateCategoryService(categoriesRepository);
export const resolveCreateCategoryService = () => createCategoryService;
