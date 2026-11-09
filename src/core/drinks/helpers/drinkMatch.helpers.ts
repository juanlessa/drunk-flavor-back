import { DrinkIngredient } from '@/core/drinks/entities/drink.entity';

/**
 * The ids of the ingredients a drink cannot be made without, in recipe order and with no repeats. The optional
 * ingredients are left out, and so are the garnishes, which are not even part of `ingredients`.
 */
export const getRequiredIngredientIds = (
	ingredients: ReadonlyArray<Pick<DrinkIngredient, 'optional'> & { ingredient: { id: string } }>,
): string[] => [...new Set(ingredients.filter(({ optional }) => !optional).map(({ ingredient }) => ingredient.id))];

/** The required ingredients that are not among the ones a person has. */
export const getMissingIngredientIds = (requiredIngredientIds: readonly string[], availableIds: ReadonlySet<string>) =>
	requiredIngredientIds.filter((id) => !availableIds.has(id));
