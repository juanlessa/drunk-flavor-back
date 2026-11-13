import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetIngredientService } from './getIngredient.container';
import { GetIngredientReqParam } from './getIngredient.dtos';

export const getIngredientController: Controller<{ Params: GetIngredientReqParam }> = async (request, reply) => {
	const { id } = request.params;

	const service = resolveGetIngredientService();

	const ingredient = await service.execute({ id });

	return reply.send(ingredient);
};
