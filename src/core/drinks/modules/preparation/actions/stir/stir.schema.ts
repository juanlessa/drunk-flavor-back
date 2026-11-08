import { durationValidation, intensityValidation } from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { StirAction } from './stir.types';

export const stirActionSchema = z.object({
	type: z.literal('stir'),
	intensity: intensityValidation.optional(),
	seconds: durationValidation.optional(),
	revolutions: durationValidation.optional(),
}) satisfies z.ZodType<StirAction>;
