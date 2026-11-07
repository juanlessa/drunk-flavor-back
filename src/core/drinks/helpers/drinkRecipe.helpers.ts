import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { DrinkGarnish, DrinkIngredient } from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { assertValidRecipe } from '@/core/drinks/helpers/recipe.helpers';
import { mapDrinkGarnishes, mapDrinkIngredients } from '@/core/drinks/mappers/drinkIngredient.mappers';
import { IIngredientsRepository } from '@/core/drinks/repositories/IIngredients.repository';
import { BadRequestError } from '@/shared/error/error.lib';

/**
 * Turns the recipe lines of a request into the lines of a drink: checks that every ingredient exists, snapshots
 * the ingredients and their units, and applies the domain rules of a recipe.
 */
export const resolveDrinkRecipe = async (
	ingredientsRepository: IIngredientsRepository,
	{ ingredients, garnishes }: { ingredients: DrinkIngredientInput[]; garnishes: DrinkGarnishInput[] },
	path: string,
): Promise<{ ingredients: DrinkIngredient[]; garnishes: DrinkGarnish[] }> => {
	// An ingredient may appear in both lists, so the existence check runs over the distinct ids.
	const uniqueIngredientIds = [...new Set([...ingredients, ...garnishes].map(({ ingredientId }) => ingredientId))];
	const existingIngredients = await ingredientsRepository.findByIdList(uniqueIngredientIds);
	if (existingIngredients.length !== uniqueIngredientIds.length) {
		throw new BadRequestError('apiResponses.drinks.someIngredientsNotExist', { path });
	}

	const ingredientsById = existingIngredients.reduce<Record<string, Ingredient>>(
		(accumulator, ingredient) => ({ ...accumulator, [ingredient.id]: ingredient }),
		{},
	);
	const recipeIngredients = mapDrinkIngredients(ingredients, ingredientsById);
	const recipeGarnishes = mapDrinkGarnishes(garnishes, ingredientsById);
	assertValidRecipe(recipeIngredients, recipeGarnishes, path);

	return { ingredients: recipeIngredients, garnishes: recipeGarnishes };
};
