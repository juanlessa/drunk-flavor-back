import { iceKindValidation, vesselRoleValidation } from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { AddIceAction } from './addIce.types';

export const addIceActionSchema = z.object({
	type: z.literal('add_ice'),
	target: vesselRoleValidation,
	kind: iceKindValidation,
}) satisfies z.ZodType<AddIceAction>;
