import { resolveIngredientsRepository } from '@/core/drinks/infra/mongo/container';
import { CreateIngredient } from '@/core/drinks/dtos/ingredient.dtos';
import { DeepPartial } from '@/shared/types/utility.types';
import { createCategory } from './category.helpers';
import { createUnit } from './unit.helpers';
import { createIngredientFactory } from '@/core/drinks/factories/ingredient.factories';

export const createIngredient = async (ingredientOptions?: DeepPartial<CreateIngredient>) => {
	const ingredientsRepository = resolveIngredientsRepository();

	const { category, id: category_id } = await createCategory();
	const { unit, id: unit_id } = await createUnit();
	const { translations, is_alcoholic } = createIngredientFactory({ category_id, unit_id, ...ingredientOptions });

	const ingredient = await ingredientsRepository.create({ translations, is_alcoholic, category, unit });
	return {
		translations,
		is_alcoholic,
		category_id,
		category,
		unit_id,
		unit,
		id: ingredient._id.toString(),
		ingredient,
	};
};
