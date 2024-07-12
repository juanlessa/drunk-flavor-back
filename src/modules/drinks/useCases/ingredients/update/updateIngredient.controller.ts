import { UpdateIngredientReqBody } from './updateIngredient.dtos';
import { Controller } from '@/shared/infra/fastify/types/fastify.types';
import { resolveUpdateIngredientService } from './updateIngredient.container';
import { HTTP_STATUS } from '@/shared/constants/httpStatus';

export const updateIngredientController: Controller = async (request, reply) => {
	const { id, translations, is_alcoholic, category_id } = request.body as UpdateIngredientReqBody;

	const service = resolveUpdateIngredientService();

	await service.execute({ id, translations, is_alcoholic, category_id });

	return reply.status(HTTP_STATUS.no_content).send();
};
