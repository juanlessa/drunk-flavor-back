import {
	garnishStyleValidation,
	recipeItemRefsValidation,
} from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { GarnishAction } from './garnish.types';

export const garnishActionSchema = z.object({
	type: z.literal('garnish'),
	items: recipeItemRefsValidation,
	style: garnishStyleValidation.optional(),
}) satisfies z.ZodType<GarnishAction>;
