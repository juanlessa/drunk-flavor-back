import { z } from 'zod';
import { updateIngredientSchema } from './updateIngredient.schema';

export type UpdateIngredientReqBody = z.infer<typeof updateIngredientSchema>;
