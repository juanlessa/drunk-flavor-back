import { z } from 'zod/v4';
import { DrinkMatchMaxMissingValue } from '@/core/drinks/dtos/drink.dtos';
import { matchDrinksQuerySchema, matchDrinksSchema } from './matchDrinks.schema';

export type MatchDrinksReqBody = z.infer<typeof matchDrinksSchema>;
export type MatchDrinksReqQuery = z.infer<typeof matchDrinksQuerySchema>;
export type MatchDrinksCommand = {
	ingredientIds: string[];
	maxMissing: DrinkMatchMaxMissingValue;
	limit?: number;
	page?: number;
};
