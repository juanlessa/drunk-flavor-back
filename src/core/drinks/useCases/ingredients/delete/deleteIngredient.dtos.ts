import { z } from 'zod';
import { deleteIngredientSchema } from './deleteIngredient.schema';

export type DeleteIngredientReqBody = z.infer<typeof deleteIngredientSchema>;
