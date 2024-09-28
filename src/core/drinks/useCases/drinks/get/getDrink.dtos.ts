import { z } from 'zod';
import { getDrinkSchema } from './getDrink.schema';

export type GetDrinkReqParams = z.infer<typeof getDrinkSchema>;
