import { z } from 'zod/v4';
import { getDrinkSchema } from './getDrink.schema';

export type GetDrinkReqParam = z.infer<typeof getDrinkSchema>;

export type GetDrinkCommand = {
	id: string;
};
