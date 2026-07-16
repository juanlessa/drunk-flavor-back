import { z } from 'zod/v4';
import { deleteIngredientSchema } from './deleteIngredient.schema';

export type DeleteIngredientReqBody = z.infer<typeof deleteIngredientSchema>;
