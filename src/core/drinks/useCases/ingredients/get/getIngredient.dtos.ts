import { z } from 'zod/v4';
import { getIngredientSchema } from './getIngredient.schema';

export type GetIngredientReqParams = z.infer<typeof getIngredientSchema>;
