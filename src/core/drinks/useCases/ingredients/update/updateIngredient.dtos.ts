import { z } from 'zod/v4';
import { UpdateIngredientTranslation } from '@/core/drinks/dtos/ingredient.dtos';
import { IngredientKind } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { Actor } from '@/shared/accessControl/actor.types';
import { updateIngredientSchema } from './updateIngredient.schema';

export type UpdateIngredientReqBody = z.infer<typeof updateIngredientSchema>;
export type UpdateIngredientDTO = {
	id: string;
	translations: Translations<UpdateIngredientTranslation>;
	categoryId: string;
	/** Full replacement of the allowed units, in display order. */
	unitIds: string[];
	/** Omitted keeps the current kind and brand. */
	kind?: IngredientKind;
	/** Omitted keeps the current brand; `null` removes it. */
	brand?: string | null;
	actor: Actor;
};
