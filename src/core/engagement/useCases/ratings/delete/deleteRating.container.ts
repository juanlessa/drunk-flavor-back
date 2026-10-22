import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { DeleteRatingService } from './DeleteRating.service';

const ratingsRepository = resolveRatingsRepository();

const deleteRatingService = new DeleteRatingService(ratingsRepository);
export const resolveDeleteRatingService = () => deleteRatingService;
