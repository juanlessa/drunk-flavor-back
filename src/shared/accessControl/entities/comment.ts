import { z } from 'zod';

export const commentPermissionSchema = z.object({
	__typename: z.literal('Comment').default('Comment'),
	id: z.string(),
	user_id: z.string(),
	drink_id: z.string(),
});

export type CommentPermissionModel = z.infer<typeof commentPermissionSchema>;
