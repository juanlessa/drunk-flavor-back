import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { ListIngredientsService } from './ListIngredients.service';

const ingredientsRepository = resolveIngredientsRepository();

const listIngredientsService = new ListIngredientsService(ingredientsRepository);
export const resolveListIngredientsService = () => listIngredientsService;
