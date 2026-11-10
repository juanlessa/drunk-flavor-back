import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateIngredientService } from './createIngredient.container';
import { CreateIngredientReqBody } from './createIngredient.dtos';

export const createIngredientController: Controller<{ Body: CreateIngredientReqBody }> = async (request, reply) => {
	const actor = { id: request.user.id, role: request.user.role };
	await resolveCreateIngredientService().execute({ ...request.body, actor });
	return reply.status(HTTP_STATUS.created).send();
};
