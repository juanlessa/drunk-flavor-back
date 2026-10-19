import { z } from 'zod/v4';
import { deleteDrinkSchema } from './deleteDrink.schema';

export type DeleteDrinkReqBody = z.infer<typeof deleteDrinkSchema>;
