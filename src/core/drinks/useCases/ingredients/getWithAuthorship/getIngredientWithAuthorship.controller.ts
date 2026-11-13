import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetIngredientWithAuthorshipService } from './getIngredientWithAuthorship.container';
import { GetIngredientWithAuthorshipReqParam } from './getIngredientWithAuthorship.dtos';

export const getIngredientWithAuthorshipController: Controller<{
	Params: GetIngredientWithAuthorshipReqParam;
}> = async (request, reply) => {
	const { id } = request.params;
	const service = resolveGetIngredientWithAuthorshipService();
	const ingredient = await service.execute({ id });
	return reply.send(ingredient);
};
