import { CreateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';
import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { createCategory } from './category.helpers';
import { createUnit } from './unit.helpers';

export const createIngredient = async (ingredientOptions?: DeepPartial<CreateIngredient>) => {
	const { category, id: categoryId } = await createCategory(ingredientOptions?.category);
	const { unit, id: unitId } = await createUnit(ingredientOptions?.unit);
	const { translations } = createIngredientFactory({ translations: ingredientOptions?.translations });
	const ingredient = await resolveIngredientsRepository().create({ translations, category, unit });
	return { translations, categoryId, category, unitId, unit, id: ingredient.id, ingredient };
};
