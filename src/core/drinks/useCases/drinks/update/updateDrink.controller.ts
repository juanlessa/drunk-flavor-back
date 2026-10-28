import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateDrinkService } from './updateDrink.container';
import { UpdateDrinkReqBody } from './updateDrink.dtos';

export const updateDrinkController: Controller<{ Body: UpdateDrinkReqBody }> = async (request, reply) => {
	await resolveUpdateDrinkService().execute(request.body);
	return reply.status(HTTP_STATUS.no_content).send();
};
