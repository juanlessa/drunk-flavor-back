import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { GetRatingService } from './GetRating.service';

const ratingsRepository = resolveRatingsRepository();

const getRatingService = new GetRatingService(ratingsRepository);
export const resolveGetRatingService = () => getRatingService;
