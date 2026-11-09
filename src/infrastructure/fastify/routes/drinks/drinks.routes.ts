import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../../helpers/fastify.helpers';
import { Routes } from '../../types/fastify.types';
import { verifyAndRenewToken } from '../../middlewares/verifyAndRenewToken';
import { createDrinkSchema } from '@/core/drinks/useCases/drinks/create/createDrink.schema';
import { createDrinkController } from '@/core/drinks/useCases/drinks/create/createDrink.controller';
import { generateMethodSchema } from '@/core/drinks/useCases/drinks/generateMethod/generateMethod.schema';
import { generateMethodController } from '@/core/drinks/useCases/drinks/generateMethod/generateMethod.controller';
import { getDrinkSchema } from '@/core/drinks/useCases/drinks/get/getDrink.schema';
import { getDrinkController } from '@/core/drinks/useCases/drinks/get/getDrink.controller';
import { listDrinksSchema } from '@/core/drinks/useCases/drinks/list/listDrinks.schema';
import { listDrinksController } from '@/core/drinks/useCases/drinks/list/listDrinks.controller';
import { matchDrinksQuerySchema, matchDrinksSchema } from '@/core/drinks/useCases/drinks/match/matchDrinks.schema';
import { matchDrinksController } from '@/core/drinks/useCases/drinks/match/matchDrinks.controller';
import { updateDrinkSchema } from '@/core/drinks/useCases/drinks/update/updateDrink.schema';
import { updateDrinkController } from '@/core/drinks/useCases/drinks/update/updateDrink.controller';
import { updateDrinkCoverSchema } from '@/core/drinks/useCases/drinks/updateCover/updateDrinkCover.schema';
import { updateDrinkCoverController } from '@/core/drinks/useCases/drinks/updateCover/updateDrinkCover.controller';
import { updateDrinkThumbnailSchema } from '@/core/drinks/useCases/drinks/updateThumbnail/updateDrinkThumbnail.schema';
import { updateDrinkThumbnailController } from '@/core/drinks/useCases/drinks/updateThumbnail/updateDrinkThumbnail.controller';
import { deleteDrinkSchema } from '@/core/drinks/useCases/drinks/delete/deleteDrink.schema';
import { deleteDrinkController } from '@/core/drinks/useCases/drinks/delete/deleteDrink.controller';
import { verifyPermissions } from '../../middlewares/verifyPermissions';
import { enforceCompleteProfile } from '../../middlewares/enforceCompleteProfile';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: createDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('create', 'Drink')],
		},
		createDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().post(
		'/drinks/method',
		{
			schema: {
				tags: ['Drinks'],
				body: generateMethodSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('create', 'Drink')],
		},
		generateMethodController,
	);
	server.withTypeProvider<ZodTypeProvider>().get(
		'/drinks/:id',
		{
			schema: {
				tags: ['Drinks'],
				params: getDrinkSchema,
			},
		},
		getDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				querystring: listDrinksSchema,
			},
		},
		listDrinksController,
	);

	// A read-only search whose input is a list, so it travels in the content of a QUERY request (RFC 10008): safe and
	// idempotent like a GET, without squeezing the list into the URL. The page stays in the URL, as in the other listings.
	server.withTypeProvider<ZodTypeProvider>().query(
		'/drinks/match',
		{
			schema: {
				tags: ['Drinks'],
				summary: 'Find drinks by the ingredients a person has',
				description:
					'Lists the drinks that use at least one of the given ingredients. Only the required ingredients of a drink count (the optional ones and the garnishes do not). `maxMissing` is how many required ingredients may be missing (0, 1, 2) or `any`; the most complete drinks come first and each one lists the ingredients that are missing. Uses the HTTP QUERY method.',
				body: matchDrinksSchema,
				querystring: matchDrinksQuerySchema,
			},
		},
		matchDrinksController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: updateDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('update', 'Drink')],
		},
		updateDrinkController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks/:id/cover',
		{
			schema: {
				tags: ['Drinks'],
				params: updateDrinkCoverSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('update', 'Drink')],
		},
		updateDrinkCoverController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/drinks/:id/thumbnail',
		{
			schema: {
				tags: ['Drinks'],
				params: updateDrinkThumbnailSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('update', 'Drink')],
		},
		updateDrinkThumbnailController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/drinks',
		{
			schema: {
				tags: ['Drinks'],
				body: deleteDrinkSchema,
			},
			preValidation: [verifyAndRenewToken, enforceCompleteProfile, verifyPermissions('delete', 'Drink')],
		},
		deleteDrinkController,
	);
};

export const drinksRoutes = pluginGenerator(routes);
