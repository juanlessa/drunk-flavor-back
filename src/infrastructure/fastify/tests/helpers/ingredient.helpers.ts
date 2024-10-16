import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { CreateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { DeepPartial } from '@/shared/types/utility.types';
import { createCategory } from './category.helpers';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';

export const createIngredient = async (ingredientOptions?: DeepPartial<CreateIngredient>) => {
	const ingredientsRepository = resolveIngredientsRepository();

	const { category, id: category_id } = await createCategory();
	const { translations, is_alcoholic } = createIngredientFactory({ category_id, ...ingredientOptions });

	const ingredient = await ingredientsRepository.create({ translations, is_alcoholic, category });
	return { translations, is_alcoholic, category_id, category, id: ingredient._id.toString(), ingredient };
};
