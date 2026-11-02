import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListCommentsByDrinkService } from './listCommentsByDrink.container';
import { ListCommentsByDrinkReqParam, ListCommentsByDrinkReqQuery } from './listCommentsByDrink.dtos';

export const listCommentsByDrinkController: Controller<{
	Params: ListCommentsByDrinkReqParam;
	Querystring: ListCommentsByDrinkReqQuery;
}> = async (request, reply) => {
	const { drinkId } = request.params;
	const { query } = request;

	const service = resolveListCommentsByDrinkService();
	const comments = await service.execute({ drinkId, query });

	return reply.send(comments);
};
