import { resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { ListRatingsService } from './ListRatings.service';

const ratingsRepository = resolveRatingsRepository();

const listRatingsService = new ListRatingsService(ratingsRepository);
export const resolveListRatingsService = () => listRatingsService;
