import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { ListCategoriesWithAuthorshipService } from './ListCategoriesWithAuthorship.service';

const categoriesRepository = resolveCategoriesRepository();

const listCategoriesWithAuthorshipService = new ListCategoriesWithAuthorshipService(categoriesRepository);

export const resolveListCategoriesWithAuthorshipService = () => listCategoriesWithAuthorshipService;
