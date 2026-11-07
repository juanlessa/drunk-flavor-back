import { GlassPreparationModes } from '@/core/drinks/modules/preparation/constants/technique.constants';
import {
	recipeItemRefValidation,
	rimCoverageValidation,
} from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { LocaleKey } from '@/shared/types/locale.types';
import { z } from 'zod/v4';
import { PrepareGlassAction } from './prepareGlass.types';

export const prepareGlassActionSchema = z.discriminatedUnion(
	'mode',
	[
		z.object({
			type: z.literal('prepare_glass'),
			mode: z.literal([GlassPreparationModes.chill, GlassPreparationModes.warm]),
		}),
		z.object({
			type: z.literal('prepare_glass'),
			mode: z.literal(GlassPreparationModes.rinse),
			item: recipeItemRefValidation,
		}),
		z.object({
			type: z.literal('prepare_glass'),
			mode: z.literal(GlassPreparationModes.rim),
			item: recipeItemRefValidation,
			coverage: rimCoverageValidation.optional(),
		}),
	],
	{ error: 'apiResponses.drinks.preparation.invalidGlassPreparationMode' satisfies LocaleKey },
) satisfies z.ZodType<PrepareGlassAction>;
