import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { ListIngredientsWithAuthorshipService } from './ListIngredientsWithAuthorship.service';

const listIngredientsWithAuthorshipService = new ListIngredientsWithAuthorshipService(resolveIngredientsRepository());

export const resolveListIngredientsWithAuthorshipService = () => listIngredientsWithAuthorshipService;
