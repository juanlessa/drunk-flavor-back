import { z } from 'zod';
import { deleteDrinkSchema } from './deleteDrink.schema';

export type DeleteDrinkReqBody = z.infer<typeof deleteDrinkSchema>;
