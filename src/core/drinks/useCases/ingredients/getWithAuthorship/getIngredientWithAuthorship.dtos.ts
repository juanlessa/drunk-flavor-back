import { z } from 'zod/v4';
import { getIngredientSchema } from '../get/getIngredient.schema';

export type GetIngredientWithAuthorshipReqParam = z.infer<typeof getIngredientSchema>;

export type GetIngredientWithAuthorshipCommand = {
	id: string;
};
