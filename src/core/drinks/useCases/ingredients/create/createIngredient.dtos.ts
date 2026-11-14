import { z } from 'zod/v4';
import { IngredientKind, IngredientTranslation } from '@/core/drinks/entities/ingredient.entity';
import { Translations } from '@/core/drinks/types/translations';
import { Actor } from '@/shared/accessControl/actor.types';
import { createIngredientSchema } from './createIngredient.schema';

export type CreateIngredientReqBody = z.infer<typeof createIngredientSchema>;

export type CreateIngredientCommand = {
	translations: Translations<IngredientTranslation>;
	categoryId: string;
	/** Allowed units in display order; empty means not measurable. */
	unitIds: string[];
	/** Defaults to `generic` when omitted. */
	kind?: IngredientKind;
	brand?: string;
	actor: Actor;
};
