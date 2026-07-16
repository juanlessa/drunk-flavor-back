import { z } from 'zod/v4';

export const categoryPermissionSchema = z.object({
	__typename: z.literal('Category').default('Category'),
	id: z.string(),
});

export type CategoryPermissionModel = z.infer<typeof categoryPermissionSchema>;
