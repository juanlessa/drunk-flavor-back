import { z } from 'zod/v4';

export const ingredientPermissionSchema = z.object({
	__typename: z.literal('Ingredient').default('Ingredient'),
	id: z.string(),
	/** Who created the record; absent once that account was closed. */
	createdBy: z.string().optional(),
});

export type IngredientPermissionModel = z.infer<typeof ingredientPermissionSchema>;
