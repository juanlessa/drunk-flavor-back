import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetSummaryByDrinkService } from './getSummaryByDrink.container';
import { GetSummaryByDrinkReqParam } from './getSummaryByDrink.dtos';

export const getSummaryByDrinkController: Controller<{ Params: GetSummaryByDrinkReqParam }> = async (
	request,
	reply,
) => {
	const { drinkId } = request.params;

	const service = resolveGetSummaryByDrinkService();
	const summary = await service.execute({ drinkId });

	return reply.send(summary);
};
