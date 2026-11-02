import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';
import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { createIngredient } from './ingredient.helpers';

export const createDrink = async (_drinkOptions?: DeepPartial<CreateDrink>) => {
	const { ingredient } = await createIngredient();
	const { translations } = createDrinkFactory();
	const drink = await resolveDrinksRepository().create({
		translations,
		ingredients: [{ ingredient, quantity: 60 }],
	});
	return { translations, id: drink.id, drink, ingredient, ingredientId: ingredient.id };
};
