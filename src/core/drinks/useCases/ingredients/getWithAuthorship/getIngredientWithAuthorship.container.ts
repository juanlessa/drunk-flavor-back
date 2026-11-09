import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { GetIngredientWithAuthorshipService } from './GetIngredientWithAuthorship.service';

const getIngredientWithAuthorshipService = new GetIngredientWithAuthorshipService(resolveIngredientsRepository());

export const resolveGetIngredientWithAuthorshipService = () => getIngredientWithAuthorshipService;
