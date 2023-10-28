import { resolveCategoriesRepository } from '@modules/drinks/container';
import { ListCategoriesService } from '@modules/drinks/useCases/listCategories/ListCategories.service';

const categoriesRepository = resolveCategoriesRepository();

const listCategoriesService = new ListCategoriesService(categoriesRepository);
export const resolveListCategoriesService = () => listCategoriesService;
