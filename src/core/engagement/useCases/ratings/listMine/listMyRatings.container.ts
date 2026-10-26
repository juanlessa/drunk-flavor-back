import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { ListMyRatingsService } from './ListMyRatings.service';

const ratingsRepository = resolveRatingsRepository();

const listMyRatingsService = new ListMyRatingsService(ratingsRepository);
export const resolveListMyRatingsService = () => listMyRatingsService;
