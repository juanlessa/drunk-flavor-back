import { z } from 'zod/v4';
import { getDrinkSchema } from './getDrink.schema';

export type GetDrinkReqParams = z.infer<typeof getDrinkSchema>;
