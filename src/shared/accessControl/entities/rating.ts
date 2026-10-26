import { z } from 'zod/v4';

export const ratingPermissionSchema = z.object({
	__typename: z.literal('Rating').default('Rating'),
	id: z.string(),
	user_id: z.string(),
	drink_id: z.string(),
});

export type RatingPermissionModel = z.infer<typeof ratingPermissionSchema>;
