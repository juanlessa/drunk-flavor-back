import { recipeItemRefValidation } from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { TopAction } from './top.types';

export const topActionSchema = z.object({
	type: z.literal('top'),
	item: recipeItemRefValidation,
}) satisfies z.ZodType<TopAction>;
