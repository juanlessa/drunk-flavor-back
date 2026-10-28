import { z } from 'zod/v4';

export const commentPermissionSchema = z.object({
	__typename: z.literal('Comment').default('Comment'),
	id: z.string(),
	userId: z.string(),
	drinkId: z.string(),
});

export type CommentPermissionModel = z.infer<typeof commentPermissionSchema>;
