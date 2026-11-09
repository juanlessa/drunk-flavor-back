import { z } from 'zod/v4';

export const unitPermissionSchema = z.object({
	__typename: z.literal('Unit').default('Unit'),
	id: z.string(),
	/** Who created the record; absent once that account was closed. */
	createdBy: z.string().optional(),
});

export type UnitPermissionModel = z.infer<typeof unitPermissionSchema>;
