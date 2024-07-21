import { z } from 'zod';
import { Translations } from '@/core/drinks/types/translations';
import { createDrinkSchema } from './createDrink.schema';
import { DrinkTranslation } from '@/core/drinks/entities/drink.entity';

export type CreateDrinkReqBody = z.infer<typeof createDrinkSchema>;

export type CreateDrinkDTO = {
	translations: Translations<DrinkTranslation>;
	ingredients: { ingredient_id: string; quantity: number }[];
};
