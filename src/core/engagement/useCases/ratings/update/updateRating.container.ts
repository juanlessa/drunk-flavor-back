import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { UpdateRatingService } from './UpdateRating.service';

const ratingsRepository = resolveRatingsRepository();

const updateRatingService = new UpdateRatingService(ratingsRepository);
export const resolveUpdateRatingService = () => updateRatingService;
