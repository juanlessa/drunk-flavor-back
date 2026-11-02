import { z } from 'zod/v4';
import { IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { updateIngredientSchema } from './updateIngredient.schema';

export type UpdateIngredientReqBody = z.infer<typeof updateIngredientSchema>;
export type UpdateIngredientDTO = {
	id: string;
	translations: Translations<IngredientTranslation>;
	categoryId: string;
	unitId: string;
};
