import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { GetMineByDrinkService } from './GetMineByDrink.service';

const ratingsRepository = resolveRatingsRepository();

const getMineByDrinkService = new GetMineByDrinkService(ratingsRepository);
export const resolveGetMineByDrinkService = () => getMineByDrinkService;
