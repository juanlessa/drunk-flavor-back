import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveMatchDrinksService } from './matchDrinks.container';
import { MatchDrinksReqBody, MatchDrinksReqQuery } from './matchDrinks.dtos';

export const matchDrinksController: Controller<{ Body: MatchDrinksReqBody; Querystring: MatchDrinksReqQuery }> = async (
	request,
	reply,
) => {
	const { ingredientIds, maxMissing } = request.body;
	const { limit, page } = request.query;
	const service = resolveMatchDrinksService();
	const result = await service.execute({ ingredientIds, maxMissing, limit, page });
	return reply.send(result);
};
