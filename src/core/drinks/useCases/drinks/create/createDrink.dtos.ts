import { z } from 'zod/v4';
import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { Translations } from '@/core/drinks/types/translations';
import { DrinkGarnishInput, DrinkIngredientInput } from '@/core/drinks/dtos/drink.dtos';
import { createDrinkSchema } from './createDrink.schema';

export type CreateDrinkReqBody = z.infer<typeof createDrinkSchema>;
export type CreateDrinkDTO = {
	translations: Translations<DrinkTranslation>;
	ingredients: DrinkIngredientInput[];
	/** Defaults to no garnishes when omitted. */
	garnishes?: DrinkGarnishInput[];
};
