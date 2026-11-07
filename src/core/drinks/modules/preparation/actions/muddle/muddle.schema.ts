import { intensityValidation } from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { MuddleAction } from './muddle.types';

export const muddleActionSchema = z.object({
	type: z.literal('muddle'),
	intensity: intensityValidation.optional(),
}) satisfies z.ZodType<MuddleAction>;
