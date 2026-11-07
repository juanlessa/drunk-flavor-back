import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { createIngredient } from './ingredient.helpers';

export const createDrink = async (_drinkOptions?: DeepPartial<CreateDrink>) => {
	const { ingredient } = await createIngredient();
	const { translations } = createDrinkFactory();
	const drink = await resolveDrinksRepository().create({
		translations,
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
