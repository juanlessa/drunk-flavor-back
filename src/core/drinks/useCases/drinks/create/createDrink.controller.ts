import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { CreateDrinkReqBody } from './createDrink.dtos';
import { resolveCreateDrinkService } from './createDrink.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

export const createDrinkController: Controller = async (request, reply) => {
	const { translations, ingredients } = request.body as CreateDrinkReqBody;

	const service = resolveCreateDrinkService();

	const drinkId = await service.execute({ translations, ingredients });

	return reply.status(HTTP_STATUS.created).send(drinkId);
};
