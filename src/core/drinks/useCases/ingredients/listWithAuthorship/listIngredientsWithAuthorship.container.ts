import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { ListIngredientsWithAuthorshipService } from './ListIngredientsWithAuthorship.service';

const ingredientsRepository = resolveIngredientsRepository();

const listIngredientsWithAuthorshipService = new ListIngredientsWithAuthorshipService(ingredientsRepository);

export const resolveListIngredientsWithAuthorshipService = () => listIngredientsWithAuthorshipService;
