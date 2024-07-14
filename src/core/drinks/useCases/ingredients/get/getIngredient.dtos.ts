import { z } from 'zod';
import { getIngredientSchema } from './getIngredient.schema';

export type GetIngredientReqParams = z.infer<typeof getIngredientSchema>;
