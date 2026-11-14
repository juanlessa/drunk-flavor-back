import { z } from 'zod/v4';
import { PreparationPlan } from '@/core/drinks/modules/preparation';
import { Translations } from '@/core/drinks/types/translations';
import { Actor } from '@/shared/accessControl/actor.types';
import { DrinkGarnishInput, DrinkIngredientInput, DrinkTranslationInput } from '@/core/drinks/dtos/drink.dtos';
import { updateDrinkSchema } from './updateDrink.schema';

export type UpdateDrinkReqBody = z.infer<typeof updateDrinkSchema>;
export type UpdateDrinkCommand = {
	id: string;
	translations: Translations<DrinkTranslationInput>;
	ingredients: DrinkIngredientInput[];
	/** Full replacement of the garnishes; send an empty list to remove them all. */
	garnishes: DrinkGarnishInput[];
	/** A plan writes the method of every language and replaces the stored plan. Without one, the stored plan is removed. */
	preparation?: PreparationPlan;
	actor: Actor;
};
