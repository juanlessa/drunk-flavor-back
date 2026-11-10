import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateDrinkService } from './createDrink.container';
import { CreateDrinkReqBody } from './createDrink.dtos';

export const createDrinkController: Controller<{ Body: CreateDrinkReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	const id = await resolveCreateDrinkService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.created).send({ id });
};
