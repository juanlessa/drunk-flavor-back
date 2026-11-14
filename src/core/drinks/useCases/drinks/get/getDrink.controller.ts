import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { GetDrinkReqParam } from './getDrink.dtos';
import { resolveGetDrinkService } from './getDrink.container';

export const getDrinkController: Controller<{ Params: GetDrinkReqParam }> = async (request, reply) => {
	const { id } = request.params;

	const service = resolveGetDrinkService();

	const drink = await service.execute({ id });

	return reply.send(drink);
};
