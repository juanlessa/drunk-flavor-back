import { z } from 'zod/v4';
import { getDrinkSchema } from '../get/getDrink.schema';

export type GetDrinkWithAuthorshipReqParams = z.infer<typeof getDrinkSchema>;
