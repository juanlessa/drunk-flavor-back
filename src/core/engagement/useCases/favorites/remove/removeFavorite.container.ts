import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { RemoveFavoriteService } from './RemoveFavorite.service';

const favoritesRepository = resolveFavoritesRepository();
const removeFavoriteService = new RemoveFavoriteService(favoritesRepository);

export const resolveRemoveFavoriteService = () => removeFavoriteService;
