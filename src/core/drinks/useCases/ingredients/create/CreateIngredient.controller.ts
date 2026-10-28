import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateIngredientService } from './createIngredient.container';
import { CreateIngredientReqBody } from './createIngredient.dtos';

export const createIngredientController: Controller<{ Body: CreateIngredientReqBody }> = async (request, reply) => {
	await resolveCreateIngredientService().execute(request.body);
	return reply.status(HTTP_STATUS.created).send();
};
