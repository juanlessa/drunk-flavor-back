import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { DeleteFavoritesByUserService } from './DeleteFavoritesByUser.service';

const favoritesRepository = resolveFavoritesRepository();
const deleteFavoritesByUserService = new DeleteFavoritesByUserService(favoritesRepository);

export const resolveDeleteFavoritesByUserService = () => deleteFavoritesByUserService;
