import { z } from 'zod';

export const drinkPermissionSchema = z.object({
	__typename: z.literal('Drink').default('Drink'),
	id: z.string(),
});

export type DrinkPermissionModel = z.infer<typeof drinkPermissionSchema>;
