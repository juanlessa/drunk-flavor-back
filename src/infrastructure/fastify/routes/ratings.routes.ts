import { createRatingController } from '@/core/engagement/useCases/ratings/create/createRating.controller';
import { createRatingSchema } from '@/core/engagement/useCases/ratings/create/createRating.schema';
import { deleteRatingController } from '@/core/engagement/useCases/ratings/delete/deleteRating.controller';
import { deleteRatingSchema } from '@/core/engagement/useCases/ratings/delete/deleteRating.schema';
import { getRatingController } from '@/core/engagement/useCases/ratings/get/getRating.controller';
import { getRatingSchema } from '@/core/engagement/useCases/ratings/get/getRating.schema';
import { listRatingsController } from '@/core/engagement/useCases/ratings/list/listRatings.controller';
import { listRatingsByDrinkController } from '@/core/engagement/useCases/ratings/listByDrink/listRatingsByDrink.controller';
import { listRatingsByDrinkSchema } from '@/core/engagement/useCases/ratings/listByDrink/listRatingsByDrink.schema';
import { listMyRatingsController } from '@/core/engagement/useCases/ratings/listMine/listMyRatings.controller';
import { updateRatingController } from '@/core/engagement/useCases/ratings/update/updateRating.controller';
import {
	updateRatingBodySchema,
	updateRatingParamsSchema,
} from '@/core/engagement/useCases/ratings/update/updateRating.schema';
import { ratingQuerySchema } from '@/core/engagement/schemas/rating.schemas';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { verifyPermissions } from '../middlewares/verifyPermissions';
import { Routes } from '../types/fastify.types';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/ratings',
		{
			schema: { tags: ['Ratings'], body: createRatingSchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'Rating')],
		},
		createRatingController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/me/ratings',
		{
			schema: { tags: ['Ratings'], querystring: ratingQuerySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('list', 'Rating')],
		},
		listMyRatingsController,
	);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get(
			'/drinks/:drink_id/ratings',
			{ schema: { tags: ['Ratings'], params: listRatingsByDrinkSchema, querystring: ratingQuerySchema } },
			listRatingsByDrinkController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/ratings', { schema: { tags: ['Ratings'], querystring: ratingQuerySchema } }, listRatingsController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/ratings/:id', { schema: { tags: ['Ratings'], params: getRatingSchema } }, getRatingController);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/ratings/:id',
		{
			schema: { tags: ['Ratings'], params: updateRatingParamsSchema, body: updateRatingBodySchema },
			preValidation: [verifyAndRenewToken],
		},
		updateRatingController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/ratings/:id',
		{
			schema: { tags: ['Ratings'], params: deleteRatingSchema },
			preValidation: [verifyAndRenewToken],
		},
		deleteRatingController,
	);
};

export const ratingsRoutes = pluginGenerator(routes);
