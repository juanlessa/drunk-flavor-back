import { resolveCategoriesRepository } from '@/core/drinks/infra/mongo/container';
import { GetCategoryWithAuthorshipService } from './GetCategoryWithAuthorship.service';

const getCategoryWithAuthorshipService = new GetCategoryWithAuthorshipService(resolveCategoriesRepository());

export const resolveGetCategoryWithAuthorshipService = () => getCategoryWithAuthorshipService;
