import { z } from 'zod';
import { createIngredientSchema } from './createIngredient.schema';
import { IngredientTranslation } from '@/modules/drinks/entities/ingredient.entity';
import { Translations } from '@/modules/drinks/types/translations';

export type CreateIngredientReqBody = z.infer<typeof createIngredientSchema>;

export type CreateIngredientDTO = {
	translations: Translations<IngredientTranslation>;
	is_alcoholic: boolean;
	category_id: string;
};
