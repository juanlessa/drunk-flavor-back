import {
	flagValidation,
	strainKindValidation,
	vesselRoleValidation,
} from '@/core/drinks/modules/preparation/schemas/fields.schemas';
import { z } from 'zod/v4';
import { StrainAction } from './strain.types';

export const strainActionSchema = z.object({
	type: z.literal('strain'),
	kind: strainKindValidation,
	to: vesselRoleValidation.optional(),
	overIce: flagValidation.optional(),
}) satisfies z.ZodType<StrainAction>;
