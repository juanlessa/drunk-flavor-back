import { z } from 'zod/v4';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { Translations } from '@/core/drinks/types/translations';
import { DrinkGarnishInput, DrinkIngredientInput, DrinkTranslationInput } from '@/core/drinks/dtos/drink.dtos';
import { createDrinkSchema } from './createDrink.schema';

export type CreateDrinkReqBody = z.infer<typeof createDrinkSchema>;
export type CreateDrinkDTO = {
	translations: Translations<DrinkTranslationInput>;
	ingredients: DrinkIngredientInput[];
	/** Defaults to no garnishes when omitted. */
	garnishes?: DrinkGarnishInput[];
	/** When present, it writes the method of every language and is stored with the drink. */
	preparation?: PreparationPlan;
};
