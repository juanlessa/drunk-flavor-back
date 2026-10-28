import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { CreateRatingService } from './CreateRating.service';

const ratingsRepository = resolveRatingsRepository();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();

const createRatingService = new CreateRatingService(ratingsRepository, drinksModule, transactionManager);
export const resolveCreateRatingService = () => createRatingService;
