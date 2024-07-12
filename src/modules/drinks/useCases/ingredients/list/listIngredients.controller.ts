import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveListIngredientsService } from './listIngredients.container';

export const listIngredientsController: Controller = async (request, reply) => {
	const service = resolveListIngredientsService();

	const ingredients = await service.execute();

	return reply.send(ingredients);
};
