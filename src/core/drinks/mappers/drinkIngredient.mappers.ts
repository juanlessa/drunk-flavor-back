import { DrinkIngredientAmountTypes } from '@/core/drinks/constants/drink.constants';
import { DrinkGarnishInput, DrinkIngredientInput, DrinkRecipeItemInput } from '@/core/drinks/dtos/drink.dtos';
import {
	DrinkGarnish,
	DrinkIngredient,
	DrinkIngredientAmount,
	DrinkRecipeItem,
} from '@/core/drinks/entities/drink.entity';
import { Ingredient } from '@/core/drinks/entities/ingredient.entity';
import { Unit } from '@/core/drinks/entities/unit.entity';
import { BadRequestError } from '@/shared/error/error.lib';

const path = 'mapDrinkIngredients';

/** Finds a unit among the ingredient's allowed units, or throws if it is not allowed. */
const resolveUnit = (ingredient: Ingredient, unitId: string): Unit => {
	const unit = ingredient.units.find((candidate) => candidate.id === unitId);
	if (!unit) {
		throw new BadRequestError('apiResponses.drinks.amountUnitNotAllowed', { path });
	}
	return unit;
};

/**
 * Resolves a request amount into a domain amount, snapshotting the unit from the ingredient's
 * units. Rejects an exact amount for a non-measurable ingredient.
 */
const resolveAmount = (ingredient: Ingredient, amount: DrinkRecipeItemInput['amount']): DrinkIngredientAmount => {
	switch (amount.type) {
		case DrinkIngredientAmountTypes.exact:
			if (ingredient.units.length === 0) {
				throw new BadRequestError('apiResponses.drinks.amountNotMeasurable', { path });
			}
			return { type: amount.type, quantity: amount.quantity, unit: resolveUnit(ingredient, amount.unitId) };
		case DrinkIngredientAmountTypes.qualitative:
			return {
				type: amount.type,
				qualifier: amount.qualifier,
				...(amount.quantity === undefined ? {} : { quantity: amount.quantity }),
				...(amount.unitId === undefined ? {} : { unit: resolveUnit(ingredient, amount.unitId) }),
			};
		case DrinkIngredientAmountTypes.none:
			return { type: amount.type };
	}
};

/** Snapshots the ingredient and resolves the amount of a recipe line (shared by ingredients and garnishes). */
const mapRecipeItem = (input: DrinkRecipeItemInput, ingredientsById: Record<string, Ingredient>): DrinkRecipeItem => {
	const ingredient = ingredientsById[input.ingredientId];
	return { ingredient, amount: resolveAmount(ingredient, input.amount) };
};

/**
 * Builds the drink's ingredient lines from request inputs and the already-fetched ingredients,
 * snapshotting each ingredient and its chosen unit into the recipe line.
 */
export const mapDrinkIngredients = (
	inputs: DrinkIngredientInput[],
	ingredientsById: Record<string, Ingredient>,
): DrinkIngredient[] => inputs.map((input) => ({ ...mapRecipeItem(input, ingredientsById), optional: input.optional }));

/** Builds the drink's garnish lines the same way as the ingredient lines, without an `optional` flag. */
export const mapDrinkGarnishes = (
	inputs: DrinkGarnishInput[],
	ingredientsById: Record<string, Ingredient>,
): DrinkGarnish[] => inputs.map((input) => mapRecipeItem(input, ingredientsById));
