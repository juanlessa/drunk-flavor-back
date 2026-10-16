import { z } from 'zod/v4';
import { updateIngredientSchema } from './updateIngredient.schema';

export type UpdateIngredientReqBody = z.infer<typeof updateIngredientSchema>;
