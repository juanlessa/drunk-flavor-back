import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { DeleteDrinkReqBody } from './deleteDrink.dtos';
import { resolveDeleteDrinkService } from './deleteDrink.container';

export const deleteDrinkController: Controller = async (request, reply) => {
	const { id } = request.body as DeleteDrinkReqBody;

	const service = resolveDeleteDrinkService();

	await service.execute({ id });

	return reply.status(HTTP_STATUS.no_content).send();
};
