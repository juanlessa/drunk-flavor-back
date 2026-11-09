import { z } from 'zod/v4';

export const drinkPermissionSchema = z.object({
	__typename: z.literal('Drink').default('Drink'),
	id: z.string(),
	/** Who created the record; absent once that account was closed. */
	createdBy: z.string().optional(),
});

export type DrinkPermissionModel = z.infer<typeof drinkPermissionSchema>;
