import { listRatingsByDrinkSchema } from '@/core/engagement/useCases/ratings/listByDrink/listRatingsByDrink.schema';
import { z } from 'zod/v4';

export type GetSummaryByDrinkReqParam = z.infer<typeof listRatingsByDrinkSchema>;

export type GetSummaryByDrinkCommand = {
	drink_id: string;
};
