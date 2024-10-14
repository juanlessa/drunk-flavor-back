import { resolveDrinksRepository } from '@/core/drinks/infra/mongo/container';
import { DeepPartial } from '@/shared/types/utility.types';
import { CreateDrink } from '@/core/drinks/dtos/drink.dtos';
import { createIngredient } from './ingredient.helpers';
import { createDrinkFactory } from '@/core/drinks/factories/drink.factories';

export const createDrink = async (drinkOptions?: DeepPartial<CreateDrink>) => {
	const drinksRepository = resolveDrinksRepository();

	const { ingredient } = await createIngredient();
	const { translations } = createDrinkFactory();

	const drink = await drinksRepository.create({ translations, ingredients: [{ ingredient, quantity: 60 }] });
	return { translations, id: drink._id.toString(), drink, ingredient, ingredient_id: ingredient._id.toString() };
};
