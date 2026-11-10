import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { FACTORY_CREATOR_ID } from '@/core/drinks/factories/authorship.factories';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { createIngredient } from './ingredient.helpers';

export const createDrink = async (drinkOptions?: DeepPartial<CreateDrink>) => {
	const { ingredient } = await createIngredient();
	const { translations } = createDrinkFactory();
	const drink = await resolveDrinksRepository().create({
		translations,
		createdBy: drinkOptions?.createdBy ?? FACTORY_CREATOR_ID,
		ingredients: [
			{
				ingredient,
				amount: { type: DrinkIngredientAmountTypes.exact, quantity: 60, unit: ingredient.units[0] },
				optional: false,
			},
		],
	});
	return { translations, id: drink.id, drink, ingredient, ingredientId: ingredient.id };
};
