import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { ListRatingsByDrinkService } from './ListRatingsByDrink.service';

const ratingsRepository = resolveRatingsRepository();

const listRatingsByDrinkService = new ListRatingsByDrinkService(ratingsRepository);
export const resolveListRatingsByDrinkService = () => listRatingsByDrinkService;
