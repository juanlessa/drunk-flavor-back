import {
	recipeItemRefValidation,
	vesselRoleValidation,
} from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { Translations } from '@/core/drinks/types/translations';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';
import { CustomAction } from './custom.types';

const requiredText = 'apiResponses.drinks.preparation.requiredText' satisfies LocaleKey;
const textValidation = z.string({ error: requiredText }).trim().min(1, { error: requiredText });

// Written out per language on purpose: adding a language to `Languages` stops this from compiling until
// the text of that language is required here too.
const customTextValidation = z.object({
	en: textValidation,
	pt: textValidation,
}) satisfies z.ZodType<Translations<string>>;

export const customActionSchema = z.object({
	type: z.literal('custom'),
	text: customTextValidation,
	items: z.array(recipeItemRefValidation).optional(),
	into: vesselRoleValidation.optional(),
}) satisfies z.ZodType<CustomAction>;
