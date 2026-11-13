import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { AddFavoriteService } from './AddFavorite.service';

const favoritesRepository = resolveFavoritesRepository();
const drinksModule = resolveDrinksModule();
const addFavoriteService = new AddFavoriteService(favoritesRepository, drinksModule);

export const resolveAddFavoriteService = () => addFavoriteService;
