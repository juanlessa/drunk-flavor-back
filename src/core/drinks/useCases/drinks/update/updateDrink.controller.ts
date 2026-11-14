import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateDrinkService } from './updateDrink.container';
import { UpdateDrinkReqBody } from './updateDrink.dtos';

export const updateDrinkController: Controller<{ Body: UpdateDrinkReqBody }> = async (request, reply) => {
	const { id, translations, ingredients, garnishes, preparation } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveUpdateDrinkService();
	await service.execute({ id, translations, ingredients, garnishes, preparation, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
