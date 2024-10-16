import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveUpdateDrinkService } from './updateDrink.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { UpdateDrinkReqBody } from './updateDrink.dtos';

export const updateDrinkController: Controller<{ Body: UpdateDrinkReqBody }> = async (request, reply) => {
	const { id, translations, ingredients } = request.body;

	const service = resolveUpdateDrinkService();

	await service.execute({ id, translations, ingredients });

	return reply.status(HTTP_STATUS.no_content).send();
};
