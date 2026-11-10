import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { ListCategoriesWithAuthorshipService } from './ListCategoriesWithAuthorship.service';

const listCategoriesWithAuthorshipService = new ListCategoriesWithAuthorshipService(resolveCategoriesRepository());

export const resolveListCategoriesWithAuthorshipService = () => listCategoriesWithAuthorshipService;
