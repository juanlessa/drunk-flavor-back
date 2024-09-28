import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { GetDrinkReqParams } from './getDrink.dtos';
import { resolveGetDrinkService } from './getDrink.container';

export const getDrinkController: Controller = async (request, reply) => {
	const { id } = request.params as GetDrinkReqParams;

	const service = resolveGetDrinkService();

	const ingredient = await service.execute({ id });

	return reply.send(ingredient);
};
