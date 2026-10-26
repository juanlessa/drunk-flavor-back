import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/infrastructure/moduleCommunication/drinks';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { DeleteRatingService } from './DeleteRating.service';

const ratingsRepository = resolveRatingsRepository();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();

const deleteRatingService = new DeleteRatingService(ratingsRepository, drinksModule, transactionManager);
export const resolveDeleteRatingService = () => deleteRatingService;
