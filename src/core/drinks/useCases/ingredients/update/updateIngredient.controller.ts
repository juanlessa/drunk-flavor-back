import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateIngredientService } from './updateIngredient.container';
import { UpdateIngredientReqBody } from './updateIngredient.dtos';

export const updateIngredientController: Controller<{ Body: UpdateIngredientReqBody }> = async (request, reply) => {
	await resolveUpdateIngredientService().execute(request.body);
	return reply.status(HTTP_STATUS.no_content).send();
};
