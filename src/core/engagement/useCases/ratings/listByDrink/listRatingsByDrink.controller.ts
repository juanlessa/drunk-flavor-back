import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveListRatingsByDrinkService } from './listRatingsByDrink.container';
import { ListRatingsByDrinkReqParam, ListRatingsByDrinkReqQuery } from './listRatingsByDrink.dtos';

export const listRatingsByDrinkController: Controller<{
	Params: ListRatingsByDrinkReqParam;
	Querystring: ListRatingsByDrinkReqQuery;
}> = async (request, reply) => {
	const { drinkId } = request.params;
	const { query } = request;

	const service = resolveListRatingsByDrinkService();
	const ratings = await service.execute({ drinkId, query });

	return reply.send(ratings);
};
