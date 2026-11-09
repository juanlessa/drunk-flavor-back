import { z } from 'zod/v4';

export const categoryPermissionSchema = z.object({
	__typename: z.literal('Category').default('Category'),
	id: z.string(),
	/** Who created the record; absent once that account was closed. */
	createdBy: z.string().optional(),
});

export type CategoryPermissionModel = z.infer<typeof categoryPermissionSchema>;
