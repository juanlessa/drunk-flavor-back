import { resolveDrinksModule } from '@/core/drinks/public';
import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { resolveStorageProvider } from '@/shared/providers/storage';
import { ListMyFavoritesService } from './ListMyFavorites.service';

const favoritesRepository = resolveFavoritesRepository();
const drinksModule = resolveDrinksModule();
const storageProvider = resolveStorageProvider();
const listMyFavoritesService = new ListMyFavoritesService(favoritesRepository, drinksModule, storageProvider);

export const resolveListMyFavoritesService = () => listMyFavoritesService;
