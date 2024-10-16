import { UpdateIngredientReqBody } from './updateIngredient.dtos';
import { Controller } from '@/infrastructure/fastify/types/fastify.types';
import { resolveUpdateIngredientService } from './updateIngredient.container';
import { HTTP_STATUS } from '@/shared/constants/http.constants';

export const updateIngredientController: Controller<{ Body: UpdateIngredientReqBody }> = async (request, reply) => {
	const { id, translations, is_alcoholic, category_id } = request.body;

	const service = resolveUpdateIngredientService();

	await service.execute({ id, translations, is_alcoholic, category_id });

	return reply.status(HTTP_STATUS.no_content).send();
};
