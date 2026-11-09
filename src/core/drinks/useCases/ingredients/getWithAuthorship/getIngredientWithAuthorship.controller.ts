import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveGetIngredientWithAuthorshipService } from './getIngredientWithAuthorship.container';
import { GetIngredientWithAuthorshipReqParams } from './getIngredientWithAuthorship.dtos';

export const getIngredientWithAuthorshipController: Controller<{
	Params: GetIngredientWithAuthorshipReqParams;
}> = async (request, reply) => {
	const ingredient = await resolveGetIngredientWithAuthorshipService().execute(request.params);
	return reply.send(ingredient);
};
