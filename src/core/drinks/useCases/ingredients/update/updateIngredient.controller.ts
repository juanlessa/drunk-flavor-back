import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { HTTP_STATUS } from '@/shared/constants/http.constants';
import { resolveUpdateIngredientService } from './updateIngredient.container';
import { UpdateIngredientReqBody } from './updateIngredient.dtos';

export const updateIngredientController: Controller<{ Body: UpdateIngredientReqBody }> = async (request, reply) => {
	const { id, translations, categoryId, unitIds, kind, brand } = request.body;
	const actor = { id: request.user.id, role: request.user.role };
	const service = resolveUpdateIngredientService();
	await service.execute({ id, translations, categoryId, unitIds, kind, brand, actor });
	return reply.status(HTTP_STATUS.no_content).send();
};
