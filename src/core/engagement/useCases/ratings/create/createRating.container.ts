import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { resolveDrinksModule } from '@/infrastructure/moduleCommunication/drinks';
import { resolveTransactionManager } from '@/infrastructure/mongo/transactions';
import { CreateRatingService } from './CreateRating.service';

const ratingsRepository = resolveRatingsRepository();
const drinksModule = resolveDrinksModule();
const transactionManager = resolveTransactionManager();

const createRatingService = new CreateRatingService(ratingsRepository, drinksModule, transactionManager);
export const resolveCreateRatingService = () => createRatingService;
