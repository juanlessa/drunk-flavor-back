import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveCreateIngredientService } from './createIngredient.container';
import { CreateIngredientReqBody } from './createIngredient.dtos';

export const createIngredientController: Controller<{ Body: CreateIngredientReqBody }> = async (request, reply) => {
	const { translations, categoryId, unitIds, kind, brand } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveCreateIngredientService();
	await service.execute({ translations, categoryId, unitIds, kind, brand, actor });
	return reply.status(HTTP_STATUS.created).send();
};
