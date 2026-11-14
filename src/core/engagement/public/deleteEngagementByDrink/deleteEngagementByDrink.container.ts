import {
	resolveCommentsRepository,
	resolveFavoritesRepository,
	resolveRatingsRepository,
} from '@/core/engagement/infra/mongo/container';
import { DeleteEngagementByDrinkService } from './DeleteEngagementByDrink.service';

const commentsRepository = resolveCommentsRepository();
const ratingsRepository = resolveRatingsRepository();
const favoritesRepository = resolveFavoritesRepository();

const deleteEngagementByDrinkService = new DeleteEngagementByDrinkService(
	commentsRepository,
	ratingsRepository,
	favoritesRepository,
);

export const resolveDeleteEngagementByDrinkService = () => deleteEngagementByDrinkService;
