import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetMineByDrinkService } from './getMineByDrink.container';
import { GetMineByDrinkReqParam } from './getMineByDrink.dtos';

export const getMineByDrinkController: Controller<{ Params: GetMineByDrinkReqParam }> = async (request, reply) => {
	const { drinkId } = request.params;
	const actor = { id: request.user.id, role: request.user.role };

	const service = resolveGetMineByDrinkService();
	const rating = await service.execute({ drinkId, actor });

	return reply.send(rating);
};
