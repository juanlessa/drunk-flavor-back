import { z } from 'zod/v4';
import { getDrinkSchema } from '../get/getDrink.schema';

export type GetDrinkWithAuthorshipReqParam = z.infer<typeof getDrinkSchema>;

export type GetDrinkWithAuthorshipCommand = {
	id: string;
};
