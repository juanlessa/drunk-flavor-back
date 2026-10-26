import { z } from 'zod/v4';

export const unitPermissionSchema = z.object({
	__typename: z.literal('Unit').default('Unit'),
	id: z.string(),
});

export type UnitPermissionModel = z.infer<typeof unitPermissionSchema>;
