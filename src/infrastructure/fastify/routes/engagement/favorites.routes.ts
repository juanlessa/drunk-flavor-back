import { addFavoriteController } from '@/core/engagement/useCases/favorites/add/addFavorite.controller';
import { addFavoriteSchema } from '@/core/engagement/useCases/favorites/add/addFavorite.schema';
import { listMyFavoritesController } from '@/core/engagement/useCases/favorites/listMine/listMyFavorites.controller';
import { listMyFavoriteDrinkIdsController } from '@/core/engagement/useCases/favorites/listMyDrinkIds/listMyFavoriteDrinkIds.controller';
import { removeFavoriteController } from '@/core/engagement/useCases/favorites/remove/removeFavorite.controller';
import { removeFavoriteSchema } from '@/core/engagement/useCases/favorites/remove/removeFavorite.schema';
import { favoriteQuerySchema } from '@/core/engagement/schemas/favorite.schemas';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../../helpers/fastify.helpers';
import { enforceCompleteProfile } from '../../middlewares/enforceCompleteProfile';
import { verifyAndRenewToken } from '../../middlewares/verifyAndRenewToken';
import { verifyPermissions } from '../../middlewares/verifyPermissions';
import { Routes } from '../../types/fastify.types';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().put(
		'/me/favorites/:drinkId',
		{
			schema: { tags: ['Favorites'], params: addFavoriteSchema },
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('create', 'Favorite')],
		},
		addFavoriteController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/me/favorites/:drinkId',
		{
			schema: { tags: ['Favorites'], params: removeFavoriteSchema },
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('delete', 'Favorite')],
		},
		removeFavoriteController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/me/favorites',
		{
			schema: { tags: ['Favorites'], querystring: favoriteQuerySchema },
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('list', 'Favorite')],
		},
		listMyFavoritesController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/me/favorites/ids',
		{
			schema: { tags: ['Favorites'] },
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('list', 'Favorite')],
		},
		listMyFavoriteDrinkIdsController,
	);
};

export const favoritesRoutes = pluginGenerator(routes);
