import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateDrinkService } from './createDrink.container';
import { CreateDrinkReqBody } from './createDrink.dtos';

export const createDrinkController: Controller<{ Body: CreateDrinkReqBody }> = async (request, reply) => {
	const { translations, ingredients, garnishes, preparation } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveCreateDrinkService();
	const id = await service.execute({ translations, ingredients, garnishes, preparation, actor });
	return reply.status(HTTP_STATUS.created).send({ id });
};
