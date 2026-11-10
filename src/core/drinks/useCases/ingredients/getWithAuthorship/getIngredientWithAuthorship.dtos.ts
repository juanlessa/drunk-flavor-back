import { z } from 'zod/v4';
import { getIngredientSchema } from '../get/getIngredient.schema';

export type GetIngredientWithAuthorshipReqParams = z.infer<typeof getIngredientSchema>;
