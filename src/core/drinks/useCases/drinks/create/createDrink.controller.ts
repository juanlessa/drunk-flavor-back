import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateDrinkReqBody } from './createDrink.dtos';
import { resolveCreateDrinkService } from './createDrink.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

export const createDrinkController: Controller<{ Body: CreateDrinkReqBody }> = async (request, reply) => {
	const { translations, ingredients } = request.body;

	const service = resolveCreateDrinkService();

	const drinkId = await service.execute({ translations, ingredients });

	return reply.status(HTTP_STATUS.created).send(drinkId);
};
