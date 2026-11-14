import { resolveFavoritesRepository } from '@/core/engagement/infra/mongo/container';
import { ListMyFavoriteDrinkIdsService } from './ListMyFavoriteDrinkIds.service';

const favoritesRepository = resolveFavoritesRepository();
const listMyFavoriteDrinkIdsService = new ListMyFavoriteDrinkIdsService(favoritesRepository);

export const resolveListMyFavoriteDrinkIdsService = () => listMyFavoriteDrinkIdsService;
