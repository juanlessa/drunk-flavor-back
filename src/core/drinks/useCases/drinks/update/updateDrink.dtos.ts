import { z } from 'zod/v4';
import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';
import { Translations } from '@/core/drinks/types/translations';
import { updateDrinkSchema } from './updateDrink.schema';

export type UpdateDrinkReqBody = z.infer<typeof updateDrinkSchema>;
export type UpdateDrinkDTO = {
	id: string;
	translations: Translations<DrinkTranslation>;
	ingredients: { ingredientId: string; quantity: number }[];
};
