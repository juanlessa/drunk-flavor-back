import { z } from 'zod/v4';
import { roleSchema } from '../roles';

export const userPermissionSchema = z.object({
	__typename: z.literal('User').default('User'),
	id: z.string(),
	role: roleSchema,
	requestedRole: roleSchema.optional(),
});

export type UserPermissionModel = z.infer<typeof userPermissionSchema>;
