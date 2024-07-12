import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveGetIngredientService } from './getIngredient.container';
import { GetIngredientReqParams } from './getIngredient.dtos';

export const getIngredientController: Controller = async (request, reply) => {
	const { id } = request.params as GetIngredientReqParams;

	const service = resolveGetIngredientService();

	const ingredient = await service.execute({ id });

	return reply.send(ingredient);
};
