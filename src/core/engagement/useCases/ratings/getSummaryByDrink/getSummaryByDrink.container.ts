import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { GetSummaryByDrinkService } from './GetSummaryByDrink.service';

const ratingsRepository = resolveRatingsRepository();

const getSummaryByDrinkService = new GetSummaryByDrinkService(ratingsRepository);
export const resolveGetSummaryByDrinkService = () => getSummaryByDrinkService;
