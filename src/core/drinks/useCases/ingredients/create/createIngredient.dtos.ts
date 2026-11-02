import { z } from 'zod/v4';
import { IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { createIngredientSchema } from './createIngredient.schema';

export type CreateIngredientReqBody = z.infer<typeof createIngredientSchema>;
export type CreateIngredientDTO = {
	translations: Translations<IngredientTranslation>;
	categoryId: string;
	unitId: string;
};
