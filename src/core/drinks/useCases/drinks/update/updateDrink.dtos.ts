import { z } from 'zod';
import { updateDrinkSchema } from './updateDrink.schema';

export type UpdateDrinkReqBody = z.infer<typeof updateDrinkSchema>;
