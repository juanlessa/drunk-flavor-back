import { resolveCategoriesRepository } from '@/core/drinks/container';
import { ListCategoriesService } from './ListCategories.service';

const categoriesRepository = resolveCategoriesRepository();

const listCategoriesService = new ListCategoriesService(categoriesRepository);
export const resolveListCategoriesService = () => listCategoriesService;
