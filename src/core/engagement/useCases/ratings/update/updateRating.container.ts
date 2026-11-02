import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { UpdateRatingService } from './UpdateRating.service';

const ratingsRepository = resolveRatingsRepository();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();

const updateRatingService = new UpdateRatingService(ratingsRepository, drinksModule, transactionManager);
export const resolveUpdateRatingService = () => updateRatingService;
