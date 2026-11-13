import { resolveCommentsRepository, resolveRatingsRepository } from '@/core/engagement/infra/mongo/container';
import { DeleteEngagementByDrinkService } from './DeleteEngagementByDrink.service';

const commentsRepository = resolveCommentsRepository();
const ratingsRepository = resolveRatingsRepository();

const deleteEngagementByDrinkService = new DeleteEngagementByDrinkService(commentsRepository, ratingsRepository);

export const resolveDeleteEngagementByDrinkService = () => deleteEngagementByDrinkService;
