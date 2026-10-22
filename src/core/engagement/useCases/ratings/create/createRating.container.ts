import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { CreateRatingService } from './CreateRating.service';

const ratingsRepository = resolveRatingsRepository();

const createRatingService = new CreateRatingService(ratingsRepository);
export const resolveCreateRatingService = () => createRatingService;
