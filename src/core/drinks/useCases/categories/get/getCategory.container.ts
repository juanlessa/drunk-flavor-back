import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { GetCategoryService } from './GetCategory.service';

const categoriesRepository = resolveCategoriesRepository();

const getCategoryService = new GetCategoryService(categoriesRepository);
export const resolveGetCategoryService = () => getCategoryService;
