import {
	recipeItemRefsValidation,
	vesselRoleValidation,
} from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { AddAction } from './add.types';

export const addActionSchema = z.object({
	type: z.literal('add'),
	target: vesselRoleValidation,
	items: recipeItemRefsValidation,
}) satisfies z.ZodType<AddAction>;
