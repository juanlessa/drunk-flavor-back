import { durationValidation, intensityValidation } from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { ShakeAction } from './shake.types';

export const shakeActionSchema = z.object({
	type: z.literal('shake'),
	intensity: intensityValidation.optional(),
	seconds: durationValidation.optional(),
}) satisfies z.ZodType<ShakeAction>;
