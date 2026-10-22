import { createCommentController } from '@/core/engagement/useCases/comments/create/createComment.controller';
import { createCommentSchema } from '@/core/engagement/useCases/comments/create/createComment.schema';
import { deleteCommentController } from '@/core/engagement/useCases/comments/delete/deleteComment.controller';
import { deleteCommentSchema } from '@/core/engagement/useCases/comments/delete/deleteComment.schema';
import { getCommentController } from '@/core/engagement/useCases/comments/get/getComment.controller';
import { getCommentSchema } from '@/core/engagement/useCases/comments/get/getComment.schema';
import { listCommentsController } from '@/core/engagement/useCases/comments/list/listComments.controller';
import { listCommentsByDrinkController } from '@/core/engagement/useCases/comments/listByDrink/listCommentsByDrink.controller';
import { listCommentsByDrinkSchema } from '@/core/engagement/useCases/comments/listByDrink/listCommentsByDrink.schema';
import { listMyCommentsController } from '@/core/engagement/useCases/comments/listMine/listMyComments.controller';
import { moderateCommentController } from '@/core/engagement/useCases/comments/moderate/moderateComment.controller';
import {
	moderateCommentBodySchema,
	moderateCommentParamsSchema,
} from '@/core/engagement/useCases/comments/moderate/moderateComment.schema';
import { updateCommentController } from '@/core/engagement/useCases/comments/update/updateComment.controller';
import {
	updateCommentBodySchema,
	updateCommentParamsSchema,
} from '@/core/engagement/useCases/comments/update/updateComment.schema';
import { commentQuerySchema } from '@/core/engagement/schemas/comment.schemas';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { pluginGenerator } from '../helpers/fastify.helpers';
import { verifyAndRenewToken } from '../middlewares/verifyAndRenewToken';
import { verifyPermissions } from '../middlewares/verifyPermissions';
import { Routes } from '../types/fastify.types';

const routes: Routes = (server) => {
	server.withTypeProvider<ZodTypeProvider>().post(
		'/comments',
		{
			schema: { tags: ['Comments'], body: createCommentSchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('create', 'Comment')],
		},
		createCommentController,
	);

	server.withTypeProvider<ZodTypeProvider>().get(
		'/me/comments',
		{
			schema: { tags: ['Comments'], querystring: commentQuerySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('list', 'Comment')],
		},
		listMyCommentsController,
	);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get(
			'/drinks/:drink_id/comments',
			{ schema: { tags: ['Comments'], params: listCommentsByDrinkSchema, querystring: commentQuerySchema } },
			listCommentsByDrinkController,
		);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/comments', { schema: { tags: ['Comments'], querystring: commentQuerySchema } }, listCommentsController);

	server
		.withTypeProvider<ZodTypeProvider>()
		.get('/comments/:id', { schema: { tags: ['Comments'], params: getCommentSchema } }, getCommentController);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/comments/:id/status',
		{
			schema: { tags: ['Comments'], params: moderateCommentParamsSchema, body: moderateCommentBodySchema },
			preValidation: [verifyAndRenewToken, verifyPermissions('moderate', 'Comment')],
		},
		moderateCommentController,
	);

	server.withTypeProvider<ZodTypeProvider>().patch(
		'/comments/:id',
		{
			schema: { tags: ['Comments'], params: updateCommentParamsSchema, body: updateCommentBodySchema },
			preValidation: [verifyAndRenewToken],
		},
		updateCommentController,
	);

	server.withTypeProvider<ZodTypeProvider>().delete(
		'/comments/:id',
		{
			schema: { tags: ['Comments'], params: deleteCommentSchema },
			preValidation: [verifyAndRenewToken],
		},
		deleteCommentController,
	);
};

export const commentsRoutes = pluginGenerator(routes);
