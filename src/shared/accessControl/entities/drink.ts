import { z } from 'zod/v4';

export const drinkPermissionSchema = z.object({
	__typename: z.literal('Drink').default('Drink'),
	id: z.string(),
});

export type DrinkPermissionModel = z.infer<typeof drinkPermissionSchema>;
