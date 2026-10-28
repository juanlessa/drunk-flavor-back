import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteRatingService } from './DeleteRating.service';

const ratingsRepository = resolveRatingsRepository();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();

const deleteRatingService = new DeleteRatingService(ratingsRepository, drinksModule, transactionManager);
export const resolveDeleteRatingService = () => deleteRatingService;
