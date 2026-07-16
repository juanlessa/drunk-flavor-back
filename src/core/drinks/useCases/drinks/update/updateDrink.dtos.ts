import { z } from 'zod/v4';
import { updateDrinkSchema } from './updateDrink.schema';

export type UpdateDrinkReqBody = z.infer<typeof updateDrinkSchema>;
