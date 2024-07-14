import { z } from 'zod';
import { createIngredientSchema } from './createIngredient.schema';
import { IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';

export type CreateIngredientReqBody = z.infer<typeof createIngredientSchema>;

export type CreateIngredientDTO = {
	translations: Translations<IngredientTranslation>;
	is_alcoholic: boolean;
	category_id: string;
};
