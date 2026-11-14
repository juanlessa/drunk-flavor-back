import { z } from 'zod/v4';
import { getIngredientSchema } from './getIngredient.schema';

export type GetIngredientReqParam = z.infer<typeof getIngredientSchema>;

export type GetIngredientCommand = {
	id: string;
};
