import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { GetIngredientWithAuthorshipService } from './GetIngredientWithAuthorship.service';

const ingredientsRepository = resolveIngredientsRepository();

const getIngredientWithAuthorshipService = new GetIngredientWithAuthorshipService(ingredientsRepository);

export const resolveGetIngredientWithAuthorshipService = () => getIngredientWithAuthorshipService;
