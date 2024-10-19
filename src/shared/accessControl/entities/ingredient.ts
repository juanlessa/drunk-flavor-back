import { z } from 'zod';

export const ingredientPermissionSchema = z.object({
	__typename: z.literal('Ingredient').default('Ingredient'),
	id: z.string(),
});

export type IngredientPermissionModel = z.infer<typeof ingredientPermissionSchema>;
