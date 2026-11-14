import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { GetCategoryWithAuthorshipService } from './GetCategoryWithAuthorship.service';

const categoriesRepository = resolveCategoriesRepository();

const getCategoryWithAuthorshipService = new GetCategoryWithAuthorshipService(categoriesRepository);

export const resolveGetCategoryWithAuthorshipService = () => getCategoryWithAuthorshipService;
