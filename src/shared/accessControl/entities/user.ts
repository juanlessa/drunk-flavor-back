import { z } from 'zod';
import { roleSchema } from '../roles';

export const userPermissionSchema = z.object({
	__typename: z.literal('User').default('User'),
	id: z.string(),
	role: roleSchema,
});

export type UserPermissionModel = z.infer<typeof userPermissionSchema>;
